import { AggregateRoot } from '@libs/domain'
import type { UniqueEntityID } from '@libs/domain/unique-entity-id'

import {
  BookingCreatedDomainEvent,
  BookingPaidDomainEvent,
  BookingRefundedDomainEvent,
  BookingConfirmedDomainEvent,
  BookingCancelledDomainEvent,
  BookingFrozenDomainEvent,
} from './booking.events'
import { BookingDetailsVO } from './booking.value-objects'
import { BookingState } from './index'

export type BookingProps = {
  readonly customerId: number
  readonly courseId: number
  readonly email: string
  bookingState: BookingState
  isFrozen: boolean
  paymentId: number | null
}

export class Booking extends AggregateRoot<BookingProps> {
  constructor(
    props: Omit<BookingProps, 'bookingState' | 'isFrozen' | 'paymentId'> & {
      paymentId?: number | null
      bookingState?: BookingState
      isFrozen?: boolean
    },
    id?: UniqueEntityID,
  ) {
    const isBrandNew = !props.bookingState

    if (isBrandNew) {
      props.bookingState = BookingState.PAYMENT_PENDING
      props.isFrozen = false
      props.paymentId = null
    }

    super(props as BookingProps, id)

    if (isBrandNew) {
      const event = new BookingCreatedDomainEvent(this)
      this.addDomainEvent(event)
    }
  }

  public static create(
    props: Omit<BookingProps, 'bookingState' | 'isFrozen' | 'paymentId'> & {
      paymentId?: number | null
      bookingState?: BookingState
      isFrozen?: boolean
    },
    id?: UniqueEntityID,
  ): Booking {
    // Should be guards
    const defaultValues = {
      ...props,
    }

    return new Booking(defaultValues, id)
  }

  approvePayment(paymentId: number): void {
    this.props.bookingState = BookingState.APPROVAL_PENDING
    this.props.paymentId = paymentId

    const event = new BookingPaidDomainEvent(this)
    this.addDomainEvent(event)
  }

  refundPayment(paymentId: number): void {
    this.props.bookingState = BookingState.CANCEL_PENDING
    this.props.paymentId = paymentId

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
    return new BookingDetailsVO(
      this.props.customerId,
      this.props.courseId,
      this.props.paymentId,
      this.props.email,
      this.props.bookingState,
      this.props.isFrozen,
    )
  }

  freezeBooking(): void {
    this.props.isFrozen = true

    const event = new BookingFrozenDomainEvent(this)
    this.addDomainEvent(event)
  }

  getId(): string {
    return this.id.toString()
  }
}
