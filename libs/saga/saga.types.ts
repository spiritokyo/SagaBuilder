import type { EventEmitter } from 'node:stream'

import type { AggregateRoot, UniqueEntityID } from '@libs/common/domain'
import type { IDomainEvent } from '@libs/common/domain/events'

export type TSagaStepContext<
  ChildAggregate extends AggregateRoot<Record<string, unknown>>,
  DTO extends Record<string, unknown>,
> = {
  dto: DTO
  childAggregate: ChildAggregate | null
}

export type SagaStep<
  ChildAggregate extends AggregateRoot<Record<string, unknown>>,
  DTO extends Record<string, unknown>,
> = {
  stepName: string
  stepCompensationName: string
  eventBus: EventEmitter

  invoke(ctx: TSagaStepContext<ChildAggregate, DTO>): Promise<void> | void
  withCompensation(ctx: TSagaStepContext<ChildAggregate, DTO>): Promise<void> | void

  invokeUpgraded(ctx: TSagaStepContext<ChildAggregate, DTO>): Promise<void> | void
  withCompensationUpgraded(ctx: TSagaStepContext<ChildAggregate, DTO>): Promise<void> | void
}

export type SagaStepClass<
  Params extends AggregateRoot<Record<string, unknown>> = AggregateRoot<Record<string, unknown>>,
  DTO extends Record<string, unknown> = Record<string, unknown>,
> = new (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ...args: any[]
) => SagaStep<Params, DTO>

export type SagaPersistenceEntity = {
  id: string
  name: string
  child_aggregate_id: string | null
  state: {
    completed_step: string
    is_compensating_direction: boolean
    is_error_saga: boolean
    is_completed: boolean
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type TEventClass = new (...args: any[]) => IDomainEvent

export type GenericSagaStateProps = {
  state: {
    // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
    completedStep: 'INITIAL' | string
    isCompensatingDirection: boolean
    isErrorSaga: boolean
    isCompleted: boolean
  }
}

export type AbstractProps<
  A extends AggregateRoot<Record<string, unknown>> = AggregateRoot<Record<string, unknown>>,
> = {
  childAggregate: A | null
  state: GenericSagaStateProps['state']
}

export type TSagaMapper<PersistenceEntity, DomainEntity> = {
  toDomain(
    persistenceEntity: PersistenceEntity,
    events: { completedEvent: TEventClass; failedEvent: TEventClass },
    stepCommands: ((eventBus: EventEmitter) => InstanceType<SagaStepClass>)[],
    name: string,
    additional?: {
      id?: UniqueEntityID
    },
  ): Promise<DomainEntity> | DomainEntity
  toPersistence(domainEntity: DomainEntity): PersistenceEntity
}

export type ISagaManager = {
  props: GenericSagaStateProps
  successfulSteps: InstanceType<SagaStepClass>[]
  steps: InstanceType<SagaStepClass>[]

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
