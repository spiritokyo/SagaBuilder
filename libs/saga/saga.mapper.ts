/* eslint-disable @typescript-eslint/no-explicit-any */
import type { EventEmitter } from 'node:events'

import type { AggregateRoot, EntityProps, UniqueEntityID } from '@libs/common/domain'
import type { TAbstractAggregateRepository } from '@libs/common/infra/repo'

import { SagaManager } from './saga.manager'
import type { SagaPersistenceEntity, SagaStepClass, TEventClass, TSagaMapper } from './saga.types'

export class SagaMapper<A extends AggregateRoot<EntityProps>, AbstractPersistenceEntity>
  implements TSagaMapper<SagaPersistenceEntity, SagaManager<A>>
{
  constructor(
    private childAggregateRepository: TAbstractAggregateRepository<A, AbstractPersistenceEntity>,
  ) {}

  async toDomain(
    sagaPersistenceEntity: SagaPersistenceEntity,
    events: { completedEvent: TEventClass; failedEvent: TEventClass },
    stepCommands: {
      stepClass: SagaStepClass
      additionalArguments?: any[]
    }[],
    name: string,
    additional?: {
      id?: UniqueEntityID
    },
  ): Promise<SagaManager<A>> {
    const { child_aggregate_id, state } = sagaPersistenceEntity

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
      child_aggregate_id: domainEntity.props.childAggregate?.id.toString() || null,
      state: {
        is_error_saga: domainEntity.getState().isErrorSaga,
        completed_step: domainEntity.getState().completedStep,
        is_compensating_direction: domainEntity.getState().isCompensatingDirection,
        is_completed: domainEntity.getState().isCompleted,
      },
    }
  }
}
