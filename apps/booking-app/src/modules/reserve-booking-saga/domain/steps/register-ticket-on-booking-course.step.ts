import type { ReserveBookingDTO } from '@reserve-booking-saga-controller/index'
import type { EventEmitter } from 'node:events'

import { Booking } from '@booking-domain/index'

import { SagaStep } from '@libs/saga/saga-step'
import type { TSagaStepContext } from '@libs/saga/saga.types'

export class RegisterTicketOnBookingCourseStep extends SagaStep<Booking, ReserveBookingDTO> {
  static STEP_NAME = 'RegisterTicketOnBookingCourseStep' as const
  static STEP_COMPENSATION_NAME = 'RegisterTicketOnBookingCourseStepCompensation' as const

  constructor(public eventBus: EventEmitter) {
    super(eventBus, {
      stepName: RegisterTicketOnBookingCourseStep.STEP_NAME,
      stepCompensationName: RegisterTicketOnBookingCourseStep.STEP_COMPENSATION_NAME,
    })
  }

  invoke(ctx: TSagaStepContext<Booking, ReserveBookingDTO>): void {
    const booking = Booking.create(ctx.dto)

    // Means that booking is persisted (will be stored in DB on the next iteration of saving)
    this.addChildAggregate(booking)
  }

  withCompensation(ctx: TSagaStepContext<Booking, ReserveBookingDTO>): void {
    if (!ctx.childAggregate) {
      return
    }

    ctx.childAggregate.cancelBooking()
  }
}
