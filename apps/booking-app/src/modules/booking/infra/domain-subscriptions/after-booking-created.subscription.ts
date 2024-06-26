import { BookingCreatedDomainEvent } from '@booking-domain/index'

import { DomainEvents } from '@libs/common/domain/events'
import type { IDomainEvent, IHandle } from '@libs/common/domain/events'

/**
 * We can inject here f.e usecases
 */
export class AfterBookingCreated implements IHandle<BookingCreatedDomainEvent> {
  constructor() {
    this.setupSubscriptions()
  }

  setupSubscriptions(): void {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    DomainEvents.register(
      this.onBookingCreated.bind(this) as (event: IDomainEvent) => void,
      BookingCreatedDomainEvent.name,
    )
  }

  private onBookingCreated(event: BookingCreatedDomainEvent): void {
    console.log(`[AfterBookingCreated]:{${JSON.stringify(event.bookingDetails)}}`)
    // logic to add events in event store about creating new booking
  }
}
