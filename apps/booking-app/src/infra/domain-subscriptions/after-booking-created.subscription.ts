import { BookingCreatedDomainEvent } from '@domain/index'
import { DomainEvents } from '@libs/domain/events'
import type { IDomainEvent, IHandle } from '@libs/domain/events'

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
    console.log(`[AfterBookingCreated]:{${JSON.stringify(event.booking.getDetails())}}`)
  }
}
