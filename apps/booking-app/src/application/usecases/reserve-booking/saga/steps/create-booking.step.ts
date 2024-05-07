import { buildCircuitBreaker } from '@libs/infra/error/utils'
import type EventEmitter from 'node:events'

import { ReserveBookingErrors } from '@infra/controllers/reserve-booking'

import type { Booking } from '@domain/index'
import { BookingDomainService, DomainBookingErrors } from '@domain/index'

import type { SagaStep } from '../saga.types'

export class CreateBookingStep implements SagaStep<Booking, void> {
  static STEP_NAME = 'CreateBookingStep' as const
  boookingDomainService = new BookingDomainService()
  // bookingRepository = new BookingRepositoryImplDatabase()

  circutBreaker = buildCircuitBreaker(
    [ReserveBookingErrors.BookingRepoInfraError],
    CreateBookingStep.STEP_NAME,
  )

  constructor(public eventBus: EventEmitter) {}

  get name(): string {
    return CreateBookingStep.STEP_NAME
  }

  async invoke(booking: Booking): Promise<void> {
    const isAvailable = await this.boookingDomainService.checkBookingAvailability(
      booking.getDetails().courseId,
    )

    if (isAvailable) {
      await this.circutBreaker.execute(() => booking.approveCreating())

      this.eventBus.emit('update:saga-state', CreateBookingStep.STEP_NAME)
      return
    }

    // TODO: should remove empty booking aggregate
    throw new DomainBookingErrors.BookingCreatedFailureDomainError(booking.getDetails())
  }

  async withCompensation(booking: Booking): Promise<void> {
    try {
      await this.circutBreaker.execute(() => booking.cancelBooking())

      this.eventBus.emit('update:saga-state', CreateBookingStep.STEP_NAME)
    } catch (err) {
      throw new DomainBookingErrors.ExceptionAbortCreateBookingTransaction(
        (err as ReserveBookingErrors.BookingRepoInfraError).message,
      )
    }
  }
}
