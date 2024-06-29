import type { Channel, ConsumeMessage } from 'amqplib'
import type { EventEmitter } from 'node:stream'

import { CONTRACTS_QUEUES } from '@libs/common/shared'

export class ReplyCreatingBookingSagaConsumerRabbitMQ {
  constructor(
    private channelBookingSagaReplyTo: Channel,
    private eventEmitter: EventEmitter,
  ) {}

  async consumeSuccessPaymentBooking(): Promise<void> {
    await this.channelBookingSagaReplyTo.consume(
      CONTRACTS_QUEUES.Q_BOOKING_SAGA_REPLY_TO_SUCCESS_PAYMENT,
      (message: ConsumeMessage | null) => {
        if (message) {
          this.eventEmitter.emit(
            message.properties.correlationId as string,
            JSON.parse(message.content.toString()),
          )
        }
      },
      {
        noAck: true,
      },
    )
  }

  async consumeFailurePaymentBooking(): Promise<void> {
    await this.channelBookingSagaReplyTo.consume(
      CONTRACTS_QUEUES.Q_BOOKING_SAGA_REPLY_TO_FAILED_PAYMENT,
      (message: ConsumeMessage | null) => {
        if (message) {
          this.eventEmitter.emit(
            message.properties.correlationId as string,
            JSON.parse(message.content.toString()),
          )
        }
      },
      {
        noAck: true,
      },
    )
  }

  async consumeCourseAvailability(): Promise<void> {
    await this.channelBookingSagaReplyTo.consume(
      CONTRACTS_QUEUES.Q_COURSE,
      (message: ConsumeMessage | null) => {
        if (message) {
          this.eventEmitter.emit(
            message.properties.correlationId as string,
            JSON.parse(message.content.toString()),
          )
        }
      },
      {
        noAck: true,
      },
    )
  }
}
