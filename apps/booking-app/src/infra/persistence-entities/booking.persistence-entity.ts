import type { BookingState } from '@domain/booking.state-machine'

/**
 * ? Structure in database
 */
export type BookingPersistenceEntity = {
  id: string
  customer_id: string
  course_id: string
  current_state: BookingState
  email: string
}
