import type { PoolClient } from 'pg'

import { ReserveBookingSagaCompletedDomainEvent } from '@reserve-booking-saga-domain/index'

import { DomainEvents } from '@libs/common/domain/events'
import type { IDomainEvent, IHandle } from '@libs/common/domain/events'

/**
 * We can inject here f.e usecases
 */
// TODO: clear saga from database
export class AfterSagaCompleted implements IHandle<ReserveBookingSagaCompletedDomainEvent> {
  constructor(private client: PoolClient) {
    this.setupSubscriptions()
  }

  setupSubscriptions(): void {
    DomainEvents.register(
      this.onSagaCompleted.bind(this) as (event: IDomainEvent) => Promise<void>,
      ReserveBookingSagaCompletedDomainEvent.name,
    )
  }

  private async onSagaCompleted(event: ReserveBookingSagaCompletedDomainEvent): Promise<void> {
    console.log(`[AfterSagaCompleted]:{${JSON.stringify(event.sagaState)}}`)

    await this.client.query(
      `
      DELETE FROM "ReserveBookingSaga" WHERE id = $1
      `,
      [event.sagaId.toString()],
    )
  }
}
