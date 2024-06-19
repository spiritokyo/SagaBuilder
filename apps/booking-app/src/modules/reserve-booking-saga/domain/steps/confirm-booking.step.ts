import type EventEmitter from 'node:events'

import type { Booking } from '@booking-domain/index'
import { DomainBookingErrors } from '@booking-domain/index'

import { ReserveBookingErrors } from '@booking-controller/index'

import { buildCircuitBreaker } from '@libs/infra/error/utils'
import type { SagaStep } from '@libs/saga'

export class ConfirmBookingStep implements SagaStep<Booking> {
  static STEP_NAME = 'ConfirmBookingStep' as const
  circutBreaker = buildCircuitBreaker(
    [ReserveBookingErrors.BookingRepoInfraError],
    ConfirmBookingStep.STEP_NAME,
  )

  constructor(public eventBus: EventEmitter) {}

  get name(): string {
    return ConfirmBookingStep.STEP_NAME
  }

  async invoke(booking: Booking): Promise<void> {
    const isBookingConfirmedSuccess = (await this.circutBreaker.execute(() =>
      booking.confirmBooking(),
    )) as boolean

    if (!isBookingConfirmedSuccess) {
      throw new DomainBookingErrors.BookingConfirmFailureDomainError(booking.getDetails())
    }

    this.eventBus.emit('update:saga-state', ConfirmBookingStep.STEP_NAME)
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  async withCompensation(_booking: Booking): Promise<void> {
    // ! We don't have compensation transaction here, because it's the lastest saga's step
  }
}
