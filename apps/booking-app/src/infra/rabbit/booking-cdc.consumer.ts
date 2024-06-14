import type { Channel, ConsumeMessage } from 'amqplib'

import { CONTRACTS_QUEUES } from '@libs/shared'

export class BookingCDCConsumerRabbitMQ {
  constructor(private channelBookingCDC: Channel) {}

  async consumeCDC(): Promise<void> {
    await this.channelBookingCDC.consume(
      CONTRACTS_QUEUES.Q_BOOKING_CDC,
      (message: ConsumeMessage | null) => {
        if (!message) {
          return
        }

        console.log(
          'Got message from [CONTRACTS_QUEUES.Q_BOOKING_CDC]',
          JSON.parse(message.content.toString()),
        )
      },
      {
        noAck: true,
      },
    )
  }
}
