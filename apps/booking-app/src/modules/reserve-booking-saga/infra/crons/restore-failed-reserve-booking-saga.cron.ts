/* eslint-disable no-restricted-syntax */
import type { ReserveBookingDTO } from '@reserve-booking-saga-controller/reserve-booking.dto'
import { CronJob } from 'cron'
import type { EventEmitter } from 'node:events'
import type { PoolClient } from 'pg'

import type { Booking } from '@booking-domain/booking.aggregate'

import { reserveBookingSagaConfig } from '@reserve-booking-saga-domain/index'

import { UniqueEntityID } from '@libs/common/domain'
import type { TSagaRepository } from '@libs/saga/repo'
import type { SagaPersistenceEntity } from '@libs/saga/saga.types'

export class RestoreFailedReserveBookingSagaCron {
  public static client: PoolClient
  public static job: CronJob
  public static reserveBookingSagaRepository: TSagaRepository<Booking>

  static initialize(
    client: PoolClient,
    reserveBookingSagaRepository: TSagaRepository<Booking>,
  ): typeof RestoreFailedReserveBookingSagaCron {
    this.client = client
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
            ...reserveBookingSagaConfig,
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
