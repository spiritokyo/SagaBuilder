import type { UniqueEntityID } from '@libs/domain'
import type { IDomainEvent } from '@libs/domain/events/domain-event.type'

import type { Booking } from './booking.aggregate'

export abstract class BookingDomainEvent implements IDomainEvent {
  public dateTimeOccurred: Date
  public booking: Booking

  abstract name: string

  constructor(booking: Booking) {
    this.dateTimeOccurred = new Date()
    this.booking = booking
  }

  getAggregateId(): UniqueEntityID {
    return this.booking.id
  }
}
// --------------------------------------------------------------

export class BookingCreatedDomainEvent extends BookingDomainEvent {
  name = 'BookingCreated'
  constructor(booking: Booking) {
    super(booking)
  }
}

export class BookingCreatedFailuredDomainEvent extends BookingDomainEvent {
  name = 'BookingCreatedFailured'
  constructor(booking: Booking) {
    super(booking)
  }
}

export class BookingPaidDomainEvent extends BookingDomainEvent implements IDomainEvent {
  name = 'BookingPaid'
  constructor(booking: Booking) {
    super(booking)
  }
}

export class BookingRefundedDomainEvent extends BookingDomainEvent {
  name = 'BookingRefunded'
  constructor(booking: Booking) {
    super(booking)
  }
}

export class BookingConfirmedDomainEvent extends BookingDomainEvent {
  name = 'BookingConfirmed'
  constructor(booking: Booking) {
    super(booking)
  }
}

export class BookingRejectedDomainEvent extends BookingDomainEvent {
  name = 'BookingRejected'
  constructor(booking: Booking) {
    super(booking)
  }
}
export class BookingCancelledDomainEvent extends BookingDomainEvent {
  name = 'BookingCancelled'
  constructor(booking: Booking) {
    super(booking)
  }
}

// TOOD: remove
export class BookingDomainEventPublisher {
  publish(bookingDomainEvents: BookingDomainEvent[]): Promise<void> {
    console.log('------------------------------------------------------------')
    // Publish domain events
    bookingDomainEvents.forEach((event) => {
      console.log(`[${event.name}]: ${JSON.stringify(event.booking, null, 2)}`)
    })
    console.log('------------------------------------------------------------')

    return Promise.resolve()
  }
}
