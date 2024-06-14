import { BookingCancelledDomainEvent } from '@domain/index'

import { DomainEvents } from '@libs/domain/events'
import type { IDomainEvent, IHandle } from '@libs/domain/events'

export class AfterBookingCancelled implements IHandle<BookingCancelledDomainEvent> {
  constructor() {
    this.setupSubscriptions()
  }

  setupSubscriptions(): void {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    DomainEvents.register(
      this.onBookingCancelled.bind(this) as (event: IDomainEvent) => void,
      BookingCancelledDomainEvent.name,
    )
  }

  private onBookingCancelled(event: BookingCancelledDomainEvent): void {
    console.log(`[AfterBookingCancelled]:{${JSON.stringify(event.booking.getDetails())}}`)
  }
}
