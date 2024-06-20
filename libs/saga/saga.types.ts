import type { EventEmitter } from 'node:stream'

import type { AggregateRoot, UniqueEntityID } from '@libs/common/domain'
import type { IDomainEvent } from '@libs/common/domain/events'

export type SagaStep<Params> = {
  name: string
  eventBus: EventEmitter

  invoke(params: Params): Promise<void>
  withCompensation(params: Params): Promise<void>
}

export type SagaPersistenceEntity = {
  id: string
  name: string
  child_aggregate_id: string
  state: {
    completed_step: string
    is_compensating_direction: boolean
    is_error_saga: boolean
    is_completed: boolean
    is_child_aggregate_persisted: boolean
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type TEventClass = new (...args: any[]) => IDomainEvent

export type GenericSagaStateProps = {
  state: {
    completedStep: string
    isCompensatingDirection: boolean
    isErrorSaga: boolean
    isCompleted: boolean
    isChildAggregatePersisted: boolean
  }
}

export type AbstractProps<
  A extends AggregateRoot<Record<string, unknown>> = AggregateRoot<Record<string, unknown>>,
> = {
  childAggregate: A
  state: GenericSagaStateProps['state']
}

export type TSagaMapper<PersistenceEntity, DomainEntity> = {
  toDomain(
    persistenceEntity: PersistenceEntity,
    events: { completedEvent: TEventClass; failedEvent: TEventClass },
    stepCommands: ((eventBus: EventEmitter) => SagaStep<AbstractProps['childAggregate']>)[],
    name: string,
    additional?: {
      id?: UniqueEntityID
    },
  ): Promise<DomainEntity> | DomainEntity
  toPersistence(domainEntity: DomainEntity): PersistenceEntity
}

export type ISagaManager = {
  props: GenericSagaStateProps
  successfulSteps: SagaStep<AbstractProps['childAggregate']>[]
  steps: SagaStep<AbstractProps['childAggregate']>[]

  readonly eventBus: EventEmitter
  readonly completedEvent: TEventClass
  readonly failedEvent: TEventClass

  saveSagaInDB(updateOnlySagaState: boolean): Promise<void>

  /**
   * @description Compensation saga was broken => freeze saga and booking
   */
  freezeSaga(): Promise<void>
  /**
   * @description Saga in compensation mode => update saga
   */
  switchToCompensatingDirection(): Promise<void>
  compeleteSaga(): Promise<void>
  listenUpdateSagaState(): void
  getId(): string
  getState(): GenericSagaStateProps['state']
}
