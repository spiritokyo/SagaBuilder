import type { TSagaStateUnion } from '@application/usecases/reserve-booking/saga/saga.types'

/**
 * ? Structure in database
 */
export type ReserveBookingSagaPersistenceEntity = {
  id: string
  props: {
    id: string
    state: {
      completed_step: TSagaStateUnion
      is_compensating_direction: boolean
      is_error_saga: boolean
    }
  }
}
