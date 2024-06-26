/* eslint-disable @typescript-eslint/no-namespace */

import type {
  BookingDetailsVO,
  IBookingDetailsExtractor,
  IPaymentDetailsExtractor,
} from '@booking-domain/index'

import { UseCaseError } from '@libs/common/core'

export namespace ReserveBookingErrors {
  export class BookingRepoInfraError extends UseCaseError implements IBookingDetailsExtractor {
    static message = 'Booking repository error'
    bookingDetails: Partial<BookingDetailsVO & { id: string }>

    constructor(bookingDetails: Partial<BookingDetailsVO & { id: string }>) {
      super(BookingRepoInfraError.message)

      this.bookingDetails = bookingDetails
    }

    extractBookingInfo(): Partial<BookingDetailsVO> {
      return this.bookingDetails
    }
  }

  export class SagaBookingRepoInfraError extends UseCaseError {
    static message = 'Saga booking repository error'

    constructor(message?: string) {
      super(message || SagaBookingRepoInfraError.message)
    }
  }

  export class BookingCourseIsNotAvailableError extends UseCaseError {
    constructor(courseId: number) {
      super(`Booking course with id = ${courseId} is not available`)
    }
  }

  export class BookingPaymentInfraError
    extends UseCaseError
    implements IPaymentDetailsExtractor, IBookingDetailsExtractor
  {
    paymentDetails: { paymentId: number }
    bookingDetails: Partial<BookingDetailsVO>

    constructor({ paymentId }: { paymentId: number }, bookingDetails: Partial<BookingDetailsVO>) {
      super('The booking payment has been failed')

      this.paymentDetails = { paymentId }
      this.bookingDetails = bookingDetails
    }

    extractBookingInfo(): Partial<BookingDetailsVO> {
      return this.bookingDetails
    }

    extractPaymentInfo(): { paymentId: number } {
      return this.paymentDetails
    }
  }
}
