import type { EventEmitter } from 'node:events'

import type { AggregateRoot, EntityProps, UniqueEntityID } from '@libs/domain'
import type { TAbstractAggregateRepository } from '@libs/infra/repo'

import { SagaManager } from './saga.manager'
import type {
  AbstractProps,
  SagaPersistenceEntity,
  SagaStep,
  TEventClass,
  TSagaMapper,
} from './saga.types'

export class SagaMapper<A extends AggregateRoot<EntityProps>, AbstractPersistenceEntity>
  implements TSagaMapper<SagaPersistenceEntity, SagaManager<A>>
{
  constructor(
    private childAggregateRepository: TAbstractAggregateRepository<A, AbstractPersistenceEntity>,
  ) {}

  async toDomain(
    sagaPersistenceEntity: SagaPersistenceEntity,
    events: { completedEvent: TEventClass; failedEvent: TEventClass },
    stepCommands: ((eventBus: EventEmitter) => SagaStep<AbstractProps['childAggregate']>)[],
    name: string,
    additional?: {
      id?: UniqueEntityID
    },
  ): Promise<SagaManager<A>> {
    const { child_aggregate_id, state } = sagaPersistenceEntity
    console.log('🚀 ~ child_aggregate_id:', child_aggregate_id)

    const aggregate = await this.childAggregateRepository.restoreAggregateFromDB(child_aggregate_id)

    if (!aggregate) {
      throw new Error('Aggregate not found')
    }

    return SagaManager.create<A>(
      {
        childAggregate: aggregate,
        state: {
          isErrorSaga: state.is_error_saga,
          completedStep: state.completed_step,
          isCompensatingDirection: state.is_compensating_direction,
          isCompleted: state.is_completed,
          isChildAggregatePersisted: state.is_child_aggregate_persisted,
        },
      },
      events,
      stepCommands,
      name,
      additional,
    )
  }

  toPersistence(domainEntity: SagaManager<A>): SagaPersistenceEntity {
    return {
      id: domainEntity.getId(),
      name: domainEntity.getName(),
      child_aggregate_id: domainEntity.props.childAggregate.id.toString(),
      state: {
        is_error_saga: domainEntity.getState().isErrorSaga,
        completed_step: domainEntity.getState().completedStep,
        is_compensating_direction: domainEntity.getState().isCompensatingDirection,
        is_completed: domainEntity.getState().isCompleted,
        is_child_aggregate_persisted: domainEntity.getState().isChildAggregatePersisted,
      },
    }
  }
}
