import { buildCircuitBreaker } from '@libs/infra/error/utils'
import type EventEmitter from 'node:events'

import { ReserveBookingErrors } from '@infra/controllers/reserve-booking'

import type { Booking } from '@domain/index'
import { DomainBookingErrors } from '@domain/index'

import type { SagaStep } from '../saga.types'

export class ConfirmBookingStep implements SagaStep<Booking, boolean> {
  static STEP_NAME = 'ConfirmBookingStep' as const
  circutBreaker = buildCircuitBreaker(
    [ReserveBookingErrors.BookingRepoInfraError],
    ConfirmBookingStep.STEP_NAME,
  )

  constructor(public eventBus: EventEmitter) {}

  get name(): string {
    return ConfirmBookingStep.STEP_NAME
  }

  async invoke(booking: Booking): Promise<boolean> {
    const isBookingConfirmedSuccess = (await this.circutBreaker.execute(() =>
      booking.confirmBooking(),
    )) as boolean

    if (!isBookingConfirmedSuccess) {
      throw new DomainBookingErrors.BookingConfirmFailureDomainError(booking.getDetails())
    }

    this.eventBus.emit('update:saga-state', ConfirmBookingStep.STEP_NAME)

    return isBookingConfirmedSuccess
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  async withCompensation(_booking: Booking): Promise<void> {
    // ! We don't have compensation transaction here, because it's the lastest saga's step
  }
}
