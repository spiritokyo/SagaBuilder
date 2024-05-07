import type { UniqueEntityID } from '../unique-entity-id'

export type IDomainEvent = {
  dateTimeOccurred: Date
  getAggregateId(): UniqueEntityID
}
