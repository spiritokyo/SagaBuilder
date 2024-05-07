import type { Channel } from 'amqplib'

export class CommandMessagePublisherRabbitMQ {
  constructor(private channelBookingSagaReplyTo: Channel) {}

  sendBookingPaymentMessageToReplyQueue(
    data: unknown,
    toQueueName: string,
    correlationId: string,
  ): boolean {
    return this.channelBookingSagaReplyTo.sendToQueue(
      toQueueName,
      Buffer.from(JSON.stringify(data)),
      {
        correlationId,
      },
    )
  }
}
