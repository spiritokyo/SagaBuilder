import type { BookingPaidDomainEvent } from '@domain/index'
import { BookingConfirmedDomainEvent } from '@domain/index'

import { DomainEvents } from '@libs/domain/events'
import type { IDomainEvent, IHandle } from '@libs/domain/events'

export class AfterBookingConfirmed implements IHandle<BookingConfirmedDomainEvent> {
  constructor() {
    this.setupSubscriptions()
  }

  setupSubscriptions(): void {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    DomainEvents.register(
      this.onBookingConfirmed.bind(this) as (event: IDomainEvent) => void,
      BookingConfirmedDomainEvent.name,
    )
  }

  private onBookingConfirmed(event: BookingPaidDomainEvent): void {
    console.log(`[AfterBookingConfirmed]:{${JSON.stringify(event.booking.getDetails())}}`)
  }
}
