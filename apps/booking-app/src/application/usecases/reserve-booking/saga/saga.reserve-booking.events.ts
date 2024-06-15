import type { UniqueEntityID } from '@libs/domain'
import type { IDomainEvent } from '@libs/domain/events/domain-event.type'

import type { ReserveBookingSaga } from './saga.reserve-booking.orchestrator'

export abstract class ReserveBookingSagaDomainEvent implements IDomainEvent {
  public dateTimeOccurred: Date
  public saga: ReserveBookingSaga

  abstract name: string

  constructor(saga: ReserveBookingSaga) {
    this.dateTimeOccurred = new Date()
    this.saga = saga
  }

  getAggregateId(): UniqueEntityID {
    return this.saga.id
  }
}
// --------------------------------------------------------------

export class ReserveBookingSagaCompletedDomainEvent extends ReserveBookingSagaDomainEvent {
  name = 'ReserveBookingSagaCompleted'
  constructor(saga: ReserveBookingSaga) {
    super(saga)
  }
}

export class ReserveBookingSagaFailedDomainEvent extends ReserveBookingSagaDomainEvent {
  name = 'ReserveBookingSagaFailed'
  constructor(saga: ReserveBookingSaga) {
    super(saga)
  }
}
