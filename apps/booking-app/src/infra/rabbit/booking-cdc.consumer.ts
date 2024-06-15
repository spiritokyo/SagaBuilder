import type { Channel, ConsumeMessage } from 'amqplib'

// import { UniqueEntityID } from '@libs/domain'
// import { DomainEvents } from '@libs/domain/events'
import { UniqueEntityID } from '@libs/domain'
import { DomainEvents } from '@libs/domain/events'
import { CONTRACTS_QUEUES } from '@libs/shared'

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

        const cdcData = JSON.parse(message.content.toString())

        const schema = cdcData.schema
        const payload = cdcData.payload.after

        if (schema.name === 'cdc.public.ReserveBookingSaga.Envelope') {
          const reserveBookingAggregateId = payload.id as string
          DomainEvents.dispatchEventsForAggregate(new UniqueEntityID(reserveBookingAggregateId))
        } else if (schema.name === 'cdc.public.Booking.Envelope') {
          const bookingAggregateId = payload.id as string
          DomainEvents.dispatchEventsForAggregate(new UniqueEntityID(bookingAggregateId))
        }
      },
      {
        noAck: true,
      },
    )
  }
}
