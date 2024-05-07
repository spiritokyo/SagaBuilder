import type { UniqueEntityID } from '@libs/domain/unique-entity-id'

import { AggregateRoot } from '@libs/domain'

import {
  BookingCreatedDomainEvent,
  BookingPaidDomainEvent,
  BookingRefundedDomainEvent,
  BookingConfirmedDomainEvent,
  BookingCancelledDomainEvent,
} from './booking.events'
import { BookingState } from './booking.state-machine'
import { BookingDetailsVO } from './booking.value-objects'

export type BookingProps = {
  readonly customerId: string
  readonly courseId: string
  readonly email: string
  bookingState?: BookingState
}

export class Booking extends AggregateRoot<BookingProps> {
  constructor(props: BookingProps, id?: UniqueEntityID) {
    super(props, id)

    if (!props.bookingState) {
      this.props.bookingState = BookingState.CREATING_PENDING
    }
  }

  public static create(props: BookingProps, id?: UniqueEntityID): Booking {
    // Should be guards

    const defaultValues: BookingProps = {
      ...props,
    }

    return new Booking(defaultValues, id)
  }

  approveCreating(): void {
    this.props.bookingState = BookingState.PAYMENT_PENDING

    const event = new BookingCreatedDomainEvent(this)
    this.addDomainEvent(event)
  }

  approvePayment(): void {
    this.props.bookingState = BookingState.APPROVAL_PENDING

    const event = new BookingPaidDomainEvent(this)
    this.addDomainEvent(event)
  }

  refundPayment(): void {
    this.props.bookingState = BookingState.CANCEL_PENDING

    const event = new BookingRefundedDomainEvent(this)
    this.addDomainEvent(event)
  }

  confirmBooking(): boolean {
    if (Math.random() > 0.1) {
      this.props.bookingState = BookingState.CONFIRMED

      const event = new BookingConfirmedDomainEvent(this)
      this.addDomainEvent(event)
      return true
    }

    return false
  }

  cancelBooking(): void {
    this.props.bookingState = BookingState.REJECTED

    const event = new BookingCancelledDomainEvent(this)
    this.addDomainEvent(event)
  }

  getDetails(): BookingDetailsVO {
    return new BookingDetailsVO(this.props.customerId, this.props.courseId, this.props.email)
  }
}
