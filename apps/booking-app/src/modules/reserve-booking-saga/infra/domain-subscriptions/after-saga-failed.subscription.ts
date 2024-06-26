import { ReserveBookingSagaFailedDomainEvent } from '@reserve-booking-saga-domain/index'

import { DomainEvents } from '@libs/common/domain/events'
import type { IDomainEvent, IHandle } from '@libs/common/domain/events'

/**
 * We can inject here f.e usecases
 */
export class AfterSagaFailed implements IHandle<ReserveBookingSagaFailedDomainEvent> {
  constructor() {
    this.setupSubscriptions()
  }

  setupSubscriptions(): void {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    DomainEvents.register(
      this.onSagaFailed.bind(this) as (event: IDomainEvent) => void,
      ReserveBookingSagaFailedDomainEvent.name,
    )
  }

  private onSagaFailed(event: ReserveBookingSagaFailedDomainEvent): void {
    console.log(`[AfterSagaFailed]:{${JSON.stringify(event.sagaState)}}`)
  }
}
