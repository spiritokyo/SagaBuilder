/* eslint-disable no-restricted-syntax */
import type { RabbitMQClient } from '@booking-shared/infra/rabbit/client'
import type { ReserveBookingDTO } from '@reserve-booking-saga-controller/reserve-booking.dto'
import { CronJob } from 'cron'
import type { PoolClient } from 'pg'

import type { Booking } from '@booking-domain/booking.aggregate'

import {
  ReserveBookingSagaCompletedDomainEvent,
  ReserveBookingSagaFailedDomainEvent,
} from '@reserve-booking-saga-domain/index'
import {
  RegisterTicketOnBookingCourseStep,
  CheckCourseAvailabilityStep,
  AuthorizePaymentStep,
  ConfirmBookingStep,
} from '@reserve-booking-saga-domain/steps'

import { UniqueEntityID } from '@libs/common/domain'
import type { TSagaRepo } from '@libs/saga/repo'
import type { SagaPersistenceEntity } from '@libs/saga/saga.types'

export class RestoreFailedReserveBookingSagaCron {
  public static client: PoolClient
  public static messageBroker: RabbitMQClient
  public static job: CronJob
  public static reserveBookingSagaRepository: TSagaRepo<Booking, ReserveBookingDTO>

  static initialize(
    client: PoolClient,
    reserveBookingSagaRepository: TSagaRepo<Booking, ReserveBookingDTO>,
    messageBroker: RabbitMQClient,
  ): typeof RestoreFailedReserveBookingSagaCron {
    this.client = client
    this.messageBroker = messageBroker
    this.reserveBookingSagaRepository = reserveBookingSagaRepository

    this.job = new CronJob(
      '1 * * * * *', // cronTime
      async () => {
        const { rows: failedReserveBookingSagas } = await this.client.query(
          `
          SELECT * FROM "Saga"
          WHERE state ->> 'is_completed' = 'false'
          LIMIT 1
          `,
        )

        for (const saga of failedReserveBookingSagas) {
          const reserveBookingSaga = await this.reserveBookingSagaRepository.restoreSaga(
            saga as SagaPersistenceEntity,
            {
              completedEvent: ReserveBookingSagaCompletedDomainEvent,
              failedEvent: ReserveBookingSagaFailedDomainEvent,
            },
            [
              // Step 1
              {
                stepClass: RegisterTicketOnBookingCourseStep,
              },
              // Step 2
              {
                stepClass: CheckCourseAvailabilityStep,
                additionalArguments: [this.messageBroker],
              },
              // Step 3
              {
                stepClass: AuthorizePaymentStep,
                additionalArguments: [this.messageBroker],
              },
              // Step 4
              {
                stepClass: ConfirmBookingStep,
              },
            ],
            // Saga name
            'ReserveBookingSaga',
            { id: new UniqueEntityID((saga as SagaPersistenceEntity).id) },
          )

          console.log(
            '🚀 ~ RestoreFailedReserveBookingSagaCron ~ reserveBookingSaga:',
            reserveBookingSaga,
          )

          if (!reserveBookingSaga) {
            continue
          }

          // await reserveBookingSaga.execute()
        }
      }, // onTick
      null, // onComplete
      true, // start
    )
    return this
  }

  static run(): void {
    this.job.start()
  }

  static stop(): void {
    this.job.stop()
  }
}
