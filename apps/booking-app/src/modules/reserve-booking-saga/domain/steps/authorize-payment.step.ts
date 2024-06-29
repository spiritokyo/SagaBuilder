import type { RabbitMQClient } from '@booking-shared/infra/rabbit/client'
import type { ReserveBookingDTO } from '@reserve-booking-saga-controller/index'
import { ReserveBookingErrors } from '@reserve-booking-saga-controller/index'
import type { EventEmitter } from 'node:events'

import type { Booking } from '@booking-domain/index'
import { DomainBookingErrors } from '@booking-domain/index'

import { AuthorizePaymentCardCommand } from '@libs/common/shared'
import { SagaStep } from '@libs/saga/saga-step'
import type { TSagaStepContext } from '@libs/saga/saga.types'

export class AuthorizePaymentStep extends SagaStep<Booking, ReserveBookingDTO> {
  static STEP_NAME = 'AuthorizePaymentStep' as const
  static STEP_COMPENSATION_NAME = 'AuthorizePaymentStepCompensation' as const

  constructor(
    public eventBus: EventEmitter,
    public readonly messageBroker: RabbitMQClient,
  ) {
    super(eventBus, {
      stepName: AuthorizePaymentStep.STEP_NAME,
      stepCompensationName: AuthorizePaymentStep.STEP_COMPENSATION_NAME,
    })
  }

  async invoke(ctx: TSagaStepContext<Booking, ReserveBookingDTO>): Promise<void> {
    if (!ctx.childAggregate) {
      return
    }

    const result = await this.messageBroker.sendAuthorizeCardCommand(
      new AuthorizePaymentCardCommand(
        ctx.childAggregate.getId(),
        ctx.childAggregate.getDetails().customerId,
      ),
    )

    if (!result.authorizedPayment) {
      throw new ReserveBookingErrors.BookingPaymentInfraError(
        { paymentId: result.paymentId },
        ctx.childAggregate.getDetails(),
      )
    }

    ctx.childAggregate.approvePayment(result.paymentId)
  }

  async withCompensation(ctx: TSagaStepContext<Booking, ReserveBookingDTO>): Promise<void> {
    if (!ctx.childAggregate) {
      return
    }

    try {
      // Make refund payment
      const paymentResult = await this.messageBroker.sendAuthorizeRefundCardCommand(
        new AuthorizePaymentCardCommand(
          ctx.childAggregate.getId(),
          ctx.childAggregate.getDetails().customerId,
        ),
      )

      if (!paymentResult.authorizedPayment) {
        throw new ReserveBookingErrors.BookingPaymentInfraError(
          { paymentId: paymentResult.paymentId },
          ctx.childAggregate.getDetails(),
        )
      }

      ctx.childAggregate.refundPayment(paymentResult.paymentId)
    } catch (err) {
      throw new DomainBookingErrors.ExceptionAbortCreateBookingTransaction(
        (err as ReserveBookingErrors.BookingRepoInfraError).message,
      )
    }
  }
}
