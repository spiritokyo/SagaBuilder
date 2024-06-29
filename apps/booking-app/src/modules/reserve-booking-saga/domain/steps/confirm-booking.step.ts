import type { ReserveBookingDTO } from '@reserve-booking-saga-controller/index'
import type EventEmitter from 'node:events'

import type { Booking } from '@booking-domain/index'
import { DomainBookingErrors } from '@booking-domain/index'

import { SagaStep } from '@libs/saga/saga-step'
import type { TSagaStepContext } from '@libs/saga/saga.types'

export class ConfirmBookingStep extends SagaStep<Booking, ReserveBookingDTO> {
  static STEP_NAME = 'ConfirmBookingStep' as const
  static STEP_COMPENSATION_NAME = 'ConfirmBookingStepCompensation' as const

  constructor(public eventBus: EventEmitter) {
    super(eventBus, {
      stepName: ConfirmBookingStep.STEP_NAME,
      stepCompensationName: ConfirmBookingStep.STEP_COMPENSATION_NAME,
    })
  }

  invoke(ctx: TSagaStepContext<Booking, ReserveBookingDTO>): void | Promise<void> {
    if (!ctx.childAggregate) {
      return
    }

    const isBookingConfirmedSuccess = ctx.childAggregate.confirmBooking()

    if (!isBookingConfirmedSuccess) {
      throw new DomainBookingErrors.BookingConfirmFailureDomainError(
        ctx.childAggregate.getDetails(),
      )
    }
  }

  withCompensation(_ctx: TSagaStepContext<Booking, ReserveBookingDTO>): void | Promise<void> {
    // ! We don't have compensation transaction here, because it's the lastest saga's step
  }
}
