import type { Channel, ConsumeMessage } from 'amqplib'

import { UniqueEntityID } from '@libs/common/domain'
import { DomainEvents } from '@libs/common/domain/events'
import { CONTRACTS_QUEUES } from '@libs/common/shared'

export class BookingCDCConsumerRabbitMQ {
  constructor(private channelBookingCDC: Channel) {}

  /**
   * @description consume booking CDC &
   * publish assosiated (with booking aggregate) domain events
   * from `DomainEvents` class
   */
  async publishDomainEvents(): Promise<void> {
    await this.channelBookingCDC.consume(
      CONTRACTS_QUEUES.Q_BOOKING_CDC,
      (message: ConsumeMessage | null) => {
        if (!message) {
          return
        }

        const cdcData =
          message.content.toString() === 'default' ? null : JSON.parse(message.content.toString())

        if (!cdcData) {
          return
        }

        const schema = cdcData.schema as { name: string }
        const payload = cdcData.payload.after as null | Record<string, unknown>

        if (payload) {
          if (schema.name === 'cdc.public.Saga.Envelope') {
            const reserveBookingAggregateId = payload.id as string
            DomainEvents.dispatchEventsForAggregate(new UniqueEntityID(reserveBookingAggregateId))
          } else if (schema.name === 'cdc.public.Booking.Envelope') {
            const bookingAggregateId = payload.id as string
            DomainEvents.dispatchEventsForAggregate(new UniqueEntityID(bookingAggregateId))
          }
        }
      },
      {
        noAck: true,
      },
    )
  }
}
