import type EventEmitter from 'node:events'

import type { Booking } from '@booking-domain/index'
import { DomainBookingErrors, BookingDomainService } from '@booking-domain/index'

import { ReserveBookingErrors } from 'apps/booking-app/src/modules/reserve-booking-saga/controller/index'

import { buildCircuitBreaker } from '@libs/common/infra/error/utils'
import type { SagaStep } from '@libs/common/saga'

export class CreateBookingStep implements SagaStep<Booking> {
  static STEP_NAME = 'CreateBookingStep' as const
  static STEP_NAME_COMPENSATION = 'CreateBookingStepCompensation' as const

  boookingDomainService = new BookingDomainService()

  circutBreaker = buildCircuitBreaker(
    [ReserveBookingErrors.BookingRepoInfraError],
    CreateBookingStep.STEP_NAME,
  )

  constructor(public eventBus: EventEmitter) {}

  get name(): string {
    return CreateBookingStep.STEP_NAME
  }

  get nameCompensation(): string {
    return CreateBookingStep.STEP_NAME_COMPENSATION
  }

  async invoke(booking: Booking): Promise<void> {
    const isAvailable = await this.boookingDomainService.checkBookingAvailability(
      booking.getDetails().courseId,
    )

    if (isAvailable) {
      this.eventBus.emit('update:saga-state', CreateBookingStep.STEP_NAME)
      // Means that booking is persisted (will be stored in DB on the next iteration of saving)
      this.eventBus.emit('update:child-aggregate-persistence', true)
      return
    }

    // TODO: should remove empty booking aggregate
    throw new DomainBookingErrors.BookingCreatedFailureDomainError(booking.getDetails())
  }

  async withCompensation(booking: Booking): Promise<void> {
    try {
      await this.circutBreaker.execute(() => booking.cancelBooking())

      this.eventBus.emit('update:saga-state', CreateBookingStep.STEP_NAME_COMPENSATION)
    } catch (err) {
      throw new DomainBookingErrors.ExceptionAbortCreateBookingTransaction(
        (err as ReserveBookingErrors.BookingRepoInfraError).message,
      )
    }
  }
}
