import type { Booking } from '@booking-domain/booking.aggregate'

import type { AggregateRoot, EntityProps, UniqueEntityID } from '@libs/common/domain'
import type { TAbstractAggregateRepository } from '@libs/common/infra/repo'

import type { TSagaRepo } from './repo'
import type { SagaStepClassInheritor } from './saga-step'
import { SagaManager } from './saga.manager'
import type { SagaPersistenceEntity, TEventClass, TSagaMapper } from './saga.types'

export class SagaMapper<A extends AggregateRoot<EntityProps>, AbstractPersistenceEntity>
  implements TSagaMapper<A, SagaPersistenceEntity, SagaManager<A>>
{
  constructor(
    private childAggregateRepository: TAbstractAggregateRepository<A, AbstractPersistenceEntity>,
  ) {}

  async toDomain(
    sagaPersistenceEntity: SagaPersistenceEntity,
    events: { completedEvent: TEventClass; failedEvent: TEventClass },
    stepCommands: {
      stepClass: SagaStepClassInheritor<A>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
      id: domainEntity.sagaManagerControl.getId(),
      name: domainEntity.sagaManagerControl.getName(),
      child_aggregate_id:
        domainEntity.sagaManagerControl.props.childAggregate?.id.toString() || null,
      state: {
        is_error_saga: domainEntity.sagaManagerControl.getState().isErrorSaga,
        completed_step: domainEntity.sagaManagerControl.getState().completedStep,
        is_compensating_direction:
          domainEntity.sagaManagerControl.getState().isCompensatingDirection,
        is_completed: domainEntity.sagaManagerControl.getState().isCompleted,
      },
    }
  }
}
