/* eslint-disable @typescript-eslint/no-misused-promises */
import { PaymentService } from '@payment-application/index'
import type { Channel, ConsumeMessage } from 'amqplib'

import { CONTRACTS_QUEUES } from '@libs/common/shared'
import type { AuthorizePaymentCardCommand } from '@libs/common/shared'

import type { CommandMessagePublisherRabbitMQ } from './command-message.publisher'

export class PaymentConsumerRabbitMQ {
  paymentService = new PaymentService()

  constructor(
    private readonly channelPayment: Channel,
    private readonly clientProducer: CommandMessagePublisherRabbitMQ,
  ) {}

  async consumePaymentForBooking(): Promise<void> {
    await this.channelPayment.consume(
      CONTRACTS_QUEUES.Q_PAYMENT,
      async (message: ConsumeMessage | null) => {
        // console.log('Got message from payment bus')

        if (!message) {
          return
        }

        const paymentResult = await this.paymentService.runPayment(
          JSON.parse(message.content.toString()) as AuthorizePaymentCardCommand,
        )

        // Based on response from payment service -> send response to appropriate queue
        const replyToQueue = paymentResult.authorizedPayment
          ? CONTRACTS_QUEUES.Q_BOOKING_SAGA_REPLY_TO_SUCCESS_PAYMENT
          : CONTRACTS_QUEUES.Q_BOOKING_SAGA_REPLY_TO_FAILED_PAYMENT

        // Send message back to the client
        this.clientProducer.sendBookingPaymentMessageToReplyQueue(
          paymentResult,
          replyToQueue,
          message.properties.correlationId as string,
        )
      },
      {
        noAck: true,
      },
    )
  }
}
