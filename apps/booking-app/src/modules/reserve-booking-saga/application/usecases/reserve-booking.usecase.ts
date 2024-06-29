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
    readonly reserveBookingSagaRepository: TSagaRepo<Booking>,
    readonly messageBroker: RabbitMQClient,
  ) {}

  public async execute(
    dto: ReserveBookingDTO,
  ): Promise<MaybeErrorResponse | ReserveBookingSagaResult> {
    try {
      // 1. Create saga instance
      const reserveBookingSaga = await ReserveBookingSaga.createAndPersist<Booking>([
        // Means that child aggregate doesn't exist yet (will be initialized later)
        { childAggregate: null },
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
      ])

      // 2. Save saga instance
      // await ReserveBookingUsecase.reserveBookingSagaRepository.saveSagaInDB(reserveBookingSaga, false)

      // 3. Run saga execution (RPC)
      return (await reserveBookingSaga.execute(dto)) as ReserveBookingSagaResult
    } catch (err) {
      return err as MaybeErrorResponse
    }
  }
}
