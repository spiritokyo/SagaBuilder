import { UniqueEntityID } from '@libs/domain'
import type { IDomainEvent } from '@libs/domain/events/domain-event.type'

import type { BookingDetailsVO } from './booking.value-objects'

export abstract class BookingDomainEvent implements IDomainEvent {
  public dateTimeOccurred: Date
  public bookingId: UniqueEntityID
  public bookingDetails: BookingDetailsVO

  abstract name: string

  constructor(bookingId: string, bookingDetails: BookingDetailsVO) {
    this.dateTimeOccurred = new Date()
    this.bookingId = new UniqueEntityID(bookingId)
    this.bookingDetails = bookingDetails
  }

  getAggregateId(): UniqueEntityID {
    return this.bookingId
  }
}
// --------------------------------------------------------------

export class BookingCreatedDomainEvent extends BookingDomainEvent {
  name = 'BookingCreated'
  constructor(bookingId: string, bookingDetails: BookingDetailsVO) {
    super(bookingId, bookingDetails)
  }
}

export class BookingCreatedFailuredDomainEvent extends BookingDomainEvent {
  name = 'BookingCreatedFailured'
  constructor(bookingId: string, bookingDetails: BookingDetailsVO) {
    super(bookingId, bookingDetails)
  }
}

export class BookingPaidDomainEvent extends BookingDomainEvent implements IDomainEvent {
  name = 'BookingPaid'
  constructor(bookingId: string, bookingDetails: BookingDetailsVO) {
    super(bookingId, bookingDetails)
  }
}

export class BookingRefundedDomainEvent extends BookingDomainEvent {
  name = 'BookingRefunded'
  constructor(bookingId: string, bookingDetails: BookingDetailsVO) {
    super(bookingId, bookingDetails)
  }
}

export class BookingConfirmedDomainEvent extends BookingDomainEvent {
  name = 'BookingConfirmed'
  constructor(bookingId: string, bookingDetails: BookingDetailsVO) {
    super(bookingId, bookingDetails)
  }
}

export class BookingRejectedDomainEvent extends BookingDomainEvent {
  name = 'BookingRejected'
  constructor(bookingId: string, bookingDetails: BookingDetailsVO) {
    super(bookingId, bookingDetails)
  }
}
export class BookingCancelledDomainEvent extends BookingDomainEvent {
  name = 'BookingCancelled'
  constructor(bookingId: string, bookingDetails: BookingDetailsVO) {
    super(bookingId, bookingDetails)
  }
}

export class BookingFrozenDomainEvent extends BookingDomainEvent {
  name = 'BookingFrozen'
  constructor(bookingId: string, bookingDetails: BookingDetailsVO) {
    super(bookingId, bookingDetails)
  }
}
