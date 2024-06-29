/* eslint-disable @typescript-eslint/no-explicit-any */
import type { PoolClient } from 'pg'

import type { AggregateRoot, EntityProps, UniqueEntityID } from '@libs/common/domain'
import type { TAbstractAggregateRepository } from '@libs/common/infra/repo'
import type { SagaStepClassInheritor } from '@libs/saga/saga-step'

import type { SagaManager, SagaPersistenceEntity, TEventClass } from '../..'
import { SagaMapper } from '../..'
import type { TSagaRepo } from '../saga.repository'

export class SagaRepositoryImplDatabase<
  A extends AggregateRoot<EntityProps>,
  AbstractPersistenceEntity,
> implements TSagaRepo<A>
{
  sagaMapper: SagaMapper<A, AbstractPersistenceEntity>

  constructor(
    readonly client: PoolClient,
    readonly childAggregateRepo: TAbstractAggregateRepository<A, AbstractPersistenceEntity>,
  ) {
    this.sagaMapper = new SagaMapper(childAggregateRepo)
  }

  async saveSagaInDB(saga: SagaManager<A>, updateOnlySagaState: boolean): Promise<void> {
    // emulateChaosError(new ReserveBookingErrors.SagaBookingRepoInfraError(), 10)

    /**
     * 1. Save child booking aggregate
     * 2. Save saga itself
     */

    // 1
    if (!updateOnlySagaState) {
      await this.childAggregateRepo.saveAggregateInDB(
        saga.sagaManagerControl.props.childAggregate as A,
      )
    }

    const sagaPersistenceEntity = this.sagaMapper.toPersistence(saga)

    // 2
    const res = await this.client.query(
      `
        INSERT INTO "Saga" ("id", "name", "child_aggregate_id", "state") VALUES ($1, $2, $3, $4)
        ON CONFLICT ("id")
        DO UPDATE
        SET
          "child_aggregate_id" = $3,
          "state" = $4
        RETURNING *
        `,
      [
        sagaPersistenceEntity.id,
        sagaPersistenceEntity.name,
        sagaPersistenceEntity.child_aggregate_id,
        JSON.stringify(sagaPersistenceEntity.state),
      ],
    )

    console.log('SAVE SAGA DB')
    console.table({
      payload: JSON.stringify(res.rows[0], null, 2),
    })
  }

  async restoreSaga(
    reserveBookingSagaPersistenceEntity: SagaPersistenceEntity | null,
    events: { completedEvent: TEventClass; failedEvent: TEventClass },
    stepCommands: {
      stepClass: SagaStepClassInheritor<A>
      additionalArguments?: any[]
    }[],
    name: string,
    additional?: {
      id?: UniqueEntityID
    },
  ): Promise<SagaManager<A> | null> {
    // emulateChaosError(new SagaBookingRepoInfraError(), 10)

    return reserveBookingSagaPersistenceEntity
      ? await this.sagaMapper.toDomain(
          reserveBookingSagaPersistenceEntity,
          events,
          stepCommands,
          name,
          additional,
        )
      : null
  }
}
