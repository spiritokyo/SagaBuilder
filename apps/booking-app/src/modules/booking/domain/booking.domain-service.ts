import type { ReserveBookingSagaResult } from '@reserve-booking-saga-domain/index'

import type { ReserveBookingErrors } from 'apps/booking-app/src/modules/reserve-booking-saga/controller/index'

import type { SagaManager, AbstractProps } from '@libs/common/saga'

import type { Booking } from './booking.aggregate'
import type { DomainBookingErrors } from './booking.errors'

export type MaybeErrorResponse =
  | ReserveBookingErrors.BookingPaymentInfraError
  | ReserveBookingErrors.BookingRepoInfraError
  | ReserveBookingErrors.SagaBookingRepoInfraError
  //
  | DomainBookingErrors.BookingConfirmFailureDomainError
  | DomainBookingErrors.BookingCreatedFailureDomainError
  | DomainBookingErrors.ExceptionAbortCreateBookingTransaction
  | DomainBookingErrors.UnsupportedStateTransitionException

export class BookingDomainService {
  async checkBookingAvailability(_courseId: number): Promise<boolean> {
    // Emulating sending async operation to 3rd party service (f.e check avaialable teachers for this course)
    if (Math.random() > 0.1) {
      return await Promise.resolve(true)
    }

    return await Promise.resolve(false)
  }

  /**
   * I'm not sure that this method belongs here, but idk where if not here
   */
  async reserveBooking(
    reserveBookingSaga: SagaManager<Booking, AbstractProps<Booking>>,
  ): Promise<MaybeErrorResponse | ReserveBookingSagaResult> {
    try {
      return (await reserveBookingSaga.execute()) as ReserveBookingSagaResult
    } catch (err: unknown) {
      return err as MaybeErrorResponse
    }
  }
}
