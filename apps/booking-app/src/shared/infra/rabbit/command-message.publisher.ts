import type { Channel } from 'amqplib'
import { randomUUID } from 'node:crypto'
import type EventEmitter from 'node:events'

import { CONTRACTS_QUEUES } from '@libs/common/shared'
import type { AuthorizePaymentCardCommand } from '@libs/common/shared'

export class CommandMessagePublisherRabbitMQ {
  constructor(
    private channelPayment: Channel,
    private eventEmitter: EventEmitter,
  ) {}

  /**
   * Authorize payment
   */
  async sendAuthorizeCardCommand(
    cmd: AuthorizePaymentCardCommand,
  ): Promise<{ authorizedPayment: boolean; paymentId: number }> {
    const correlationId = randomUUID()

    this.channelPayment.sendToQueue(CONTRACTS_QUEUES.Q_PAYMENT, Buffer.from(JSON.stringify(cmd)), {
      correlationId,
      replyTo: CONTRACTS_QUEUES.Q_BOOKING_SAGA_REPLY_TO_SUCCESS_PAYMENT,
    })

    return await new Promise((resolve) => {
      this.eventEmitter.once(
        correlationId,
        (_data: { authorizedPayment: boolean; paymentId: number }) => {
          resolve(_data)
        },
      )
    })
  }

  /**
   * Refund payment
   */
  async sendAuthorizeRefundCardCommand(
    cmd: AuthorizePaymentCardCommand,
  ): Promise<{ authorizedPayment: boolean; paymentId: number }> {
    const correlationId = randomUUID()

    this.channelPayment.sendToQueue(CONTRACTS_QUEUES.Q_PAYMENT, Buffer.from(JSON.stringify(cmd)), {
      correlationId,
      replyTo: CONTRACTS_QUEUES.Q_BOOKING_SAGA_REPLY_TO_FAILED_PAYMENT,
    })

    return await new Promise((resolve) => {
      this.eventEmitter.once(
        correlationId,
        (_data: { authorizedPayment: boolean; paymentId: number }) => {
          resolve(_data)
        },
      )
    })
  }
}
