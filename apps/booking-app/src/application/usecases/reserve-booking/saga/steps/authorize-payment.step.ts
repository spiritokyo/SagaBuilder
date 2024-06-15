import type EventEmitter from 'node:events'

import { DomainBookingErrors } from '@domain/index'
import type { Booking } from '@domain/index'

import { ReserveBookingErrors } from '@infra/controllers/reserve-booking'
import type { RabbitMQClient } from '@infra/rabbit/client'

import { buildCircuitBreaker } from '@libs/infra/error/utils'
import { AuthorizePaymentCardCommand } from '@libs/shared'

import type { SagaStep } from '../saga.types'

export class AuthorizePaymentStep
  implements
    SagaStep<
      Booking,
      {
        paymentId: number
      }
    >
{
  static STEP_NAME = 'AuthorizePaymentStep' as const

  circutBreaker = buildCircuitBreaker(
    [ReserveBookingErrors.BookingRepoInfraError],
    AuthorizePaymentStep.STEP_NAME,
  )

  constructor(public eventBus: EventEmitter, public readonly messageBroker: RabbitMQClient) {}

  get name(): string {
    return AuthorizePaymentStep.STEP_NAME
  }

  async invoke(booking: Booking): Promise<{
    paymentId: number
  }> {
    const result = await this.messageBroker.sendAuthorizeCardCommand(
      new AuthorizePaymentCardCommand(booking.getId(), booking.getDetails().customerId),
    )

    if (!result.authorizedPayment) {
      throw new ReserveBookingErrors.BookingPaymentInfraError(
        { paymentId: result.paymentId },
        booking.getDetails(),
      )
    }

    await this.circutBreaker.execute(() => booking.approvePayment())

    this.eventBus.emit('update:saga-state', AuthorizePaymentStep.STEP_NAME)

    return { paymentId: result.paymentId }
  }

  async withCompensation(booking: Booking): Promise<{
    paymentId: number
  }> {
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

      await this.circutBreaker.execute(() => booking.refundPayment())

      this.eventBus.emit('update:saga-state', AuthorizePaymentStep.STEP_NAME)

      return { paymentId: paymentResult.paymentId }
    } catch (err) {
      throw new DomainBookingErrors.ExceptionAbortCreateBookingTransaction(
        (err as ReserveBookingErrors.BookingRepoInfraError).message,
      )
    }
  }
}
