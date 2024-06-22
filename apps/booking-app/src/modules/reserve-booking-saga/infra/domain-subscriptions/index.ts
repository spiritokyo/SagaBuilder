/* eslint-disable no-new */
// Subscriptions

import type { PoolClient } from 'pg'

import { AfterSagaCompleted } from './after-saga-completed.subscription'
import { AfterSagaFailed } from './after-saga-failed.subscription'

export function initializeReserveBookingSagaDomainSubscribers(connection: PoolClient): void {
  new AfterSagaCompleted(connection)
  new AfterSagaFailed()

  console.log('[ReserveBookingSaga domain subscribers]: Initialized')
}
