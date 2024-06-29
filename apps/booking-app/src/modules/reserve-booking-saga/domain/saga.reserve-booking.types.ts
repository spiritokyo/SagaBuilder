import type { BookingDetailsVO } from '@booking-domain/booking.value-objects'

import type {
  AuthorizePaymentStep,
  CheckCourseAvailabilityStep,
  ConfirmBookingStep,
  RegisterTicketOnBookingCourseStep,
} from './steps'

export type TSagaStateUnion =
  | typeof RegisterTicketOnBookingCourseStep.STEP_NAME
  | typeof CheckCourseAvailabilityStep.STEP_COMPENSATION_NAME
  | typeof AuthorizePaymentStep.STEP_NAME
  | typeof ConfirmBookingStep.STEP_NAME

export type ReserveBookingSagaResult = Pick<
  BookingDetailsVO,
  'paymentId' | 'customerId' | 'courseId' | 'email'
> & { bookingId: string }
