import type { BookingDetailsVO } from '@booking-domain/booking.value-objects'

import type { CreateBookingStep, AuthorizePaymentStep, ConfirmBookingStep } from './steps'

export type TSagaStateUnion =
  | 'INITIAL'
  | typeof CreateBookingStep.STEP_NAME
  | typeof AuthorizePaymentStep.STEP_NAME
  | typeof ConfirmBookingStep.STEP_NAME

export type ReserveBookingSagaResult = Pick<
  BookingDetailsVO,
  'paymentId' | 'customerId' | 'courseId' | 'email'
> & { bookingId: string }
