import type { IDomainEvent } from './domain-event.type'

export type IHandle<_T extends IDomainEvent> = {
  setupSubscriptions(): void
}
