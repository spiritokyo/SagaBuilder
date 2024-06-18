import type EventEmitter from 'node:events'

import type { AggregateRoot, EntityProps, UniqueEntityID } from '@libs/domain'

import type { SagaManager } from '../saga.manager'
import type { AbstractProps, SagaPersistenceEntity, SagaStep, TEventClass } from '../saga.types'

export type TSagaRepository<
  ChildAggregate extends AggregateRoot<EntityProps> = AggregateRoot<EntityProps>,
> = {
  /**
   *
   * @param reserveBookingSaga
   * @param updateOnlySagaState - if true, only reserve booking saga state will be updated in DB
   */
  saveSagaInDB(saga: SagaManager<ChildAggregate>, updateOnlySagaState: boolean): Promise<void>
  /**
   * @description restore reserve booking aggregate from DB based on `sagaId`
   */
  restoreSaga(
    reserveBookingSagaPersistenceEntity: SagaPersistenceEntity | null,
    events: { completedEvent: TEventClass; failedEvent: TEventClass },
    stepCommands: ((eventBus: EventEmitter) => SagaStep<AbstractProps['childAggregate']>)[],
    name: string,
    additional?: {
      id?: UniqueEntityID
    },
  ): Promise<SagaManager<ChildAggregate> | null>
}
