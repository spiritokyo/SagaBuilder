/* eslint-disable no-new */
// Subscriptions

import { AfterBookingConfirmed } from './after-booking-confirmed.subscription'
import { AfterBookingCreated } from './after-booking-created.subscription'

/**
 * Just there is no sense to check out all subscribers
 */
export function initializeBookingDomainSubscribers(): void {
  new AfterBookingCreated()
  new AfterBookingConfirmed()

  console.log('[Booking domain subscribers]: Initialized')
}
