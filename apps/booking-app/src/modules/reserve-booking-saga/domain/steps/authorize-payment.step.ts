import type { RabbitMQClient } from '@booking-shared/infra/rabbit/client'
import { ReserveBookingErrors } from '@reserve-booking-saga-controller/index'
import type { EventEmitter } from 'node:events'

import type { Booking } from '@booking-domain/index'
import { DomainBookingErrors } from '@booking-domain/index'

import { buildCircuitBreaker } from '@libs/common/infra/error/utils'
import { AuthorizePaymentCardCommand } from '@libs/common/shared'
import type { SagaStepClass } from '@libs/saga/saga.types'

export class AuthorizePaymentStep implements InstanceType<SagaStepClass<Booking>> {
  static STEP_NAME = 'AuthorizePaymentStep' as const
  static STEP_NAME_COMPENSATION = 'AuthorizePaymentStepCompensation' as const

  circutBreaker = buildCircuitBreaker(
    [ReserveBookingErrors.BookingRepoInfraError],
    AuthorizePaymentStep.STEP_NAME,
  )

  constructor(
    public eventBus: EventEmitter,
    public readonly messageBroker: RabbitMQClient,
  ) {}

  get name(): string {
    return AuthorizePaymentStep.STEP_NAME
  }

  get nameCompensation(): string {
    return AuthorizePaymentStep.STEP_NAME_COMPENSATION
  }

  async invoke(booking: Booking): Promise<void> {
    const result = await this.messageBroker.sendAuthorizeCardCommand(
      new AuthorizePaymentCardCommand(booking.getId(), booking.getDetails().customerId),
    )

    if (!result.authorizedPayment) {
      throw new ReserveBookingErrors.BookingPaymentInfraError(
        { paymentId: result.paymentId },
        booking.getDetails(),
      )
    }

    await this.circutBreaker.execute(() => booking.approvePayment(result.paymentId))

    this.eventBus.emit('update:saga-state', AuthorizePaymentStep.STEP_NAME)
  }

  async withCompensation(booking: Booking): Promise<void> {
    try {
      // Make refund payment
      const paymentResult = await this.messageBroker.sendAuthorizeRefundCardCommand(
        new AuthorizePaymentCardCommand(booking.getId(), booking.getDetails().customerId),
      )

      if (!paymentResult.authorizedPayment) {
        throw new ReserveBookingErrors.BookingPaymentInfraError(
          { paymentId: paymentResult.paymentId },
          booking.getDetails(),
        )
      }

      await this.circutBreaker.execute(() => booking.refundPayment(paymentResult.paymentId))

      this.eventBus.emit('update:saga-state', AuthorizePaymentStep.STEP_NAME_COMPENSATION)
    } catch (err) {
      throw new DomainBookingErrors.ExceptionAbortCreateBookingTransaction(
        (err as ReserveBookingErrors.BookingRepoInfraError).message,
      )
    }
  }
}
