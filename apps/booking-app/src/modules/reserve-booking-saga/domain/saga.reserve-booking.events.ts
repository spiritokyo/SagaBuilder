import { UniqueEntityID } from '@libs/domain'
import type { IDomainEvent } from '@libs/domain/events/domain-event.type'
import type { AbstractProps } from '@libs/shared/saga/saga.types'

export abstract class ReserveBookingSagaDomainEvent implements IDomainEvent {
  public dateTimeOccurred: Date
  public sagaId: UniqueEntityID
  public sagaState: AbstractProps['state']

  abstract name: string

  constructor(sagaId: string, sagaState: AbstractProps['state']) {
    this.dateTimeOccurred = new Date()
    this.sagaId = new UniqueEntityID(sagaId)
    this.sagaState = sagaState
  }

  getAggregateId(): UniqueEntityID {
    return this.sagaId
  }
}
// --------------------------------------------------------------

export class ReserveBookingSagaCompletedDomainEvent extends ReserveBookingSagaDomainEvent {
  name = 'ReserveBookingSagaCompleted'
  constructor(sagaId: string, sagaState: AbstractProps['state']) {
    super(sagaId, sagaState)
  }
}

export class ReserveBookingSagaFailedDomainEvent extends ReserveBookingSagaDomainEvent {
  name = 'ReserveBookingSagaFailed'
  constructor(sagaId: string, sagaState: AbstractProps['state']) {
    super(sagaId, sagaState)
  }
}
