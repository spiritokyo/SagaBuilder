import type { RabbitMQClient } from '@booking-shared/infra/rabbit/client'
import type { ReserveBookingDTO } from '@reserve-booking-saga-controller/index'
import { ReserveBookingErrors } from '@reserve-booking-saga-controller/index'
import type { EventEmitter } from 'node:events'

import type { Booking } from '@booking-domain/index'

import { CheckCourseAvailabilityCommand } from '@libs/common/shared'
import { SagaStep } from '@libs/saga/saga-step'
import type { TSagaStepContext } from '@libs/saga/saga.types'

export class CheckCourseAvailabilityStep extends SagaStep<Booking, ReserveBookingDTO> {
  static STEP_NAME = 'CheckCourseAvailabilityStep' as const
  static STEP_COMPENSATION_NAME = 'CheckCourseAvailabilityStepCompensation' as const

  constructor(
    public eventBus: EventEmitter,
    public readonly messageBroker: RabbitMQClient,
  ) {
    super(eventBus, {
      stepName: CheckCourseAvailabilityStep.STEP_NAME,
      stepCompensationName: CheckCourseAvailabilityStep.STEP_COMPENSATION_NAME,
    })
  }

  async invoke(ctx: TSagaStepContext<Booking, ReserveBookingDTO>): Promise<void> {
    if (!ctx.childAggregate) {
      throw new Error('Child aggregate is not defined')
    }

    const result = await this.messageBroker.sendCheckCourseAvailabilityCommand(
      new CheckCourseAvailabilityCommand(ctx.childAggregate.getDetails().courseId),
    )

    if (!result.isCourseAvailable) {
      throw new ReserveBookingErrors.BookingCourseIsNotAvailableError(
        ctx.childAggregate.getDetails().courseId,
      )
    }
    ctx.childAggregate.approveCourseAvailability()
  }

  withCompensation(_ctx: TSagaStepContext<Booking, ReserveBookingDTO>): void | Promise<void> {
    // Should be empty
  }
}
