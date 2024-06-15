import { ReserveBookingSagaCompletedDomainEvent } from '@reserve-booking-saga-domain/index'

import { DomainEvents } from '@libs/domain/events'
import type { IDomainEvent, IHandle } from '@libs/domain/events'

/**
 * We can inject here f.e usecases
 */
// TODO: clear saga from database
export class AfterSagaCompleted implements IHandle<ReserveBookingSagaCompletedDomainEvent> {
  constructor() {
    this.setupSubscriptions()
  }

  setupSubscriptions(): void {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    DomainEvents.register(
      this.onSagaCompleted.bind(this) as (event: IDomainEvent) => void,
      ReserveBookingSagaCompletedDomainEvent.name,
    )
  }

  private onSagaCompleted(event: ReserveBookingSagaCompletedDomainEvent): void {
    console.log(`[AfterSagaCompleted]:{${JSON.stringify(event.saga.getState())}}`)
  }
}
