import type { RabbitMQClient } from '@booking-shared/infra/rabbit/client'
import type { ReserveBookingDTO } from '@reserve-booking-saga-controller/index'

import type { Booking, MaybeErrorResponse } from '@booking-domain/index'

import type { ReserveBookingSagaResult } from '@reserve-booking-saga-domain/index'
import {
  ReserveBookingSaga,
  ReserveBookingSagaCompletedDomainEvent,
  ReserveBookingSagaFailedDomainEvent,
} from '@reserve-booking-saga-domain/index'
import {
  AuthorizePaymentStep,
  CheckCourseAvailabilityStep,
  ConfirmBookingStep,
  RegisterTicketOnBookingCourseStep,
} from '@reserve-booking-saga-domain/steps'

import type { UseCase } from '@libs/common/core'
import type { TSagaRepo } from '@libs/saga/repo'

export class ReserveBookingUsecase
  implements UseCase<ReserveBookingDTO, MaybeErrorResponse | ReserveBookingSagaResult>
{
  constructor(
    readonly reserveBookingSagaRepository: TSagaRepo<Booking, ReserveBookingDTO>,
    readonly messageBroker: RabbitMQClient,
  ) {}

  public async execute(
    dto: ReserveBookingDTO,
  ): Promise<MaybeErrorResponse | ReserveBookingSagaResult> {
    try {
      // 1. Create saga instance
      const reserveBookingSaga = await ReserveBookingSaga.createAndPersist<
        Booking,
        ReserveBookingDTO
      >([
        {
          props: {
            // Means that child aggregate doesn't exist yet (will be initialized later)
            childAggregate: null,
          },
          events: {
            // Will be emitted when saga will be completed
            completedEvent: ReserveBookingSagaCompletedDomainEvent,
            // Will be emitted if saga will be failed
            failedEvent: ReserveBookingSagaFailedDomainEvent,
          },
          stepCommands: [
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
          name: 'ReserveBookingSaga',
        },
      ])

      // 2. Run saga execution (RPC)
      return (await reserveBookingSaga.execute(dto)) as ReserveBookingSagaResult
    } catch (err) {
      return err as MaybeErrorResponse
    }
  }
}
