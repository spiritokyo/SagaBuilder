import type { TSagaStateUnion } from '@reserve-booking-saga-domain/index'

/**
 * ? Structure in database
 */
export type ReserveBookingSagaPersistenceEntity = {
  id: string
  bookingId: string
  state: {
    completed_step: TSagaStateUnion
    is_compensating_direction: boolean
    is_error_saga: boolean
    is_completed: boolean
  }
}
