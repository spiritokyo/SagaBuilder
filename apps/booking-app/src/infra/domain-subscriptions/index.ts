/* eslint-disable no-new */
// Subscriptions

import { AfterBookingCancelled } from './after-booking-cancelled.subscription'
import { AfterBookingConfirmed } from './after-booking-confirmed.subscription'
import { AfterBookingCreated } from './after-booking-created.subscription'
import { AfterBookingPaid } from './after-booking-paid.subscription'
import { AfterBookingRefunded } from './after-booking-refunded.subscription'

export function initializeBookingDomainSubscribers(): void {
  new AfterBookingCreated()
  new AfterBookingPaid()
  new AfterBookingConfirmed()

  new AfterBookingRefunded()
  new AfterBookingCancelled()

  console.log('Initialize subscription listeners')
}
