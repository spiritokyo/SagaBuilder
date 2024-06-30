/* eslint-disable @typescript-eslint/no-explicit-any */
import type { EventEmitter } from 'node:stream'

import type { AggregateRoot, EntityProps, UniqueEntityID } from '@libs/common/domain'
import type { IDomainEvent } from '@libs/common/domain/events'

import type { SagaStep, SagaStepClassInheritor } from './saga-step'

export type TSagaStepContext<
  ChildAggregate extends AggregateRoot<Record<string, unknown>>,
  DTO extends Record<string, unknown>,
> = {
  dto: DTO
  childAggregate: ChildAggregate | null
}

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
    completedStep: string
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

export type TSagaMapper<
  A extends AggregateRoot<Record<string, unknown>>,
  PersistenceEntity,
  DomainEntity,
> = {
  toDomain(
    persistenceEntity: PersistenceEntity,
    events: { completedEvent: TEventClass; failedEvent: TEventClass },
    stepCommands: {
      stepClass: SagaStepClassInheritor<A>
      additionalArguments?: any[]
    }[],
    name: string,
    additional?: {
      id?: UniqueEntityID
    },
  ): Promise<DomainEntity> | DomainEntity
  toPersistence(domainEntity: DomainEntity): PersistenceEntity
}

export type ISagaManager<A extends AggregateRoot<Record<string, unknown>>> = {
  props: GenericSagaStateProps
  successfulSteps: SagaStep<A>[]
  steps: SagaStep<A>[]

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

export type SagaCreateOptions<A extends AggregateRoot<EntityProps>> = {
  props: Omit<AbstractProps<A>, 'state'> & {
    state?: AbstractProps<A>['state']
  }
  events: { completedEvent: TEventClass; failedEvent: TEventClass }
  stepCommands: {
    stepClass: SagaStepClassInheritor<A>
    additionalArguments?: any[]
  }[]
  name: string
  additional?: {
    id?: UniqueEntityID
  }
}
