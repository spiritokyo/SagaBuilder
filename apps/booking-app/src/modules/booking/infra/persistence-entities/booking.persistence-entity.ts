import type { BookingState } from '@booking-domain/index'

/**
 * ? Structure in database
 */
export type BookingPersistenceEntity = {
  id: string
  customer_id: number
  course_id: number
  payment_id: number | null
  current_state: BookingState
  email: string
  is_frozen: boolean
}
