/* eslint-disable @typescript-eslint/no-namespace */

import type { BookingState } from './booking.state-machine'
import type { BookingDetailsVO } from './booking.value-objects'

export type IBookingDetailsExtractor = {
  extractBookingInfo(): Partial<BookingDetailsVO>
}

export type IPaymentDetailsExtractor = {
  extractPaymentInfo(): { paymentId: number }
}

export namespace DomainBookingErrors {
  export class BookingCreatedFailureDomainError extends Error implements IBookingDetailsExtractor {
    bookingDetails: Partial<BookingDetailsVO>

    constructor(bookingDetails: Partial<BookingDetailsVO>) {
      super('The booking is not created. Booking is not available')

      this.bookingDetails = bookingDetails
    }

    extractBookingInfo(): Partial<BookingDetailsVO> {
      return this.bookingDetails
    }
  }

  export class BookingConfirmFailureDomainError extends Error implements IBookingDetailsExtractor {
    bookingDetails: Partial<BookingDetailsVO>

    constructor(bookingDetails: Partial<BookingDetailsVO>) {
      super('The booking confrimation has been failed')

      this.bookingDetails = bookingDetails
    }

    extractBookingInfo(): Partial<BookingDetailsVO> {
      return this.bookingDetails
    }
  }

  export class UnsupportedStateTransitionException extends Error {
    constructor(readonly state: BookingState) {
      super(`Unsupported state transition for order: ${state}`)
    }
  }

  export class ExceptionAbortCreateBookingTransaction extends Error {
    constructor(reason: string) {
      super(reason)
    }
  }
}
