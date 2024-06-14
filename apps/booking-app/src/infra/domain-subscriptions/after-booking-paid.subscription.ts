import type { BookingPaidDomainEvent } from '@domain/index'

import { DomainEvents } from '@libs/domain/events'
import type { IDomainEvent, IHandle } from '@libs/domain/events'

export class AfterBookingPaid implements IHandle<BookingPaidDomainEvent> {
  constructor() {
    this.setupSubscriptions()
  }

  setupSubscriptions(): void {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    DomainEvents.register(
      this.onBookingPaid.bind(this) as (event: IDomainEvent) => void,
      AfterBookingPaid.name,
    )
  }

  private onBookingPaid(event: BookingPaidDomainEvent): void {
    console.log(`[AfterBookingPaid]:{${JSON.stringify(event.booking.getDetails())}}`)
  }
}
