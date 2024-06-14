import { BookingRefundedDomainEvent } from '@domain/index'

import { DomainEvents } from '@libs/domain/events'
import type { IDomainEvent, IHandle } from '@libs/domain/events'

export class AfterBookingRefunded implements IHandle<BookingRefundedDomainEvent> {
  constructor() {
    this.setupSubscriptions()
  }

  setupSubscriptions(): void {
    DomainEvents.register(
      this.onBookingRefunded.bind(this) as (event: IDomainEvent) => void,
      BookingRefundedDomainEvent.name,
    )
  }

  private onBookingRefunded(event: BookingRefundedDomainEvent): void {
    console.log(`[AfterBookingRefunded]:{${JSON.stringify(event.booking.getDetails())}}`)
  }
}
