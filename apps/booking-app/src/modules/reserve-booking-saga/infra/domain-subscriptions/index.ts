/* eslint-disable no-new */
// Subscriptions

import { AfterSagaCompleted } from './after-saga-completed.subscription'
import { AfterSagaFailed } from './after-saga-failed.subscription'

export function initializeReserveBookingSagaDomainSubscribers(): void {
  new AfterSagaCompleted()
  new AfterSagaFailed()

  console.log('Initialize subscription listeners')
}
