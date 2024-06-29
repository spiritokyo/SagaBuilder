import { ReserveBookingErrors } from '@reserve-booking-saga-controller/reserve-booking.errors'
import type { EventEmitter } from 'node:events'
import type { PoolClient } from 'pg'

import type { AggregateRoot, EntityProps, UniqueEntityID } from '@libs/common/domain'
import type { TAbstractAggregateRepository } from '@libs/common/infra/repo'

import type {
  SagaManager,
  SagaPersistenceEntity,
  TEventClass,
  SagaStepClass,
  AbstractProps,
} from '../..'
import { SagaMapper } from '../..'
import type { TSagaRepository } from '../saga.repository'

export class SagaRepositoryImplDatabase<
  A extends AggregateRoot<EntityProps>,
  AbstractPersistenceEntity,
> implements TSagaRepository<A>
{
  sagaMapper: SagaMapper<A, AbstractPersistenceEntity>

  constructor(
    readonly client: PoolClient,
    readonly childAggregateRepo: TAbstractAggregateRepository<A, AbstractPersistenceEntity>,
  ) {
    this.sagaMapper = new SagaMapper(childAggregateRepo)
  }

  static initialize<A extends AggregateRoot<EntityProps>, AbstractPersistenceEntity>(
    client: PoolClient,
    childAggregateRepo: TAbstractAggregateRepository<A, AbstractPersistenceEntity>,
  ): TSagaRepository<A> {
    return new SagaRepositoryImplDatabase(client, childAggregateRepo)
  }

  async saveSagaInDB(saga: SagaManager<A>, updateOnlySagaState: boolean): Promise<void> {
    // emulateChaosError(new ReserveBookingErrors.SagaBookingRepoInfraError(), 10)

    /**
     * 1. Save child booking aggregate
     * 2. Save saga itself
     */

    // 1
    if (!updateOnlySagaState && saga.props.childAggregate) {
      await this.childAggregateRepo.saveAggregateInDB(saga.props.childAggregate)
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
    stepCommands: ((
      eventBus: EventEmitter,
    ) => InstanceType<SagaStepClass<NonNullable<AbstractProps<A>['childAggregate']>>>)[],
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
