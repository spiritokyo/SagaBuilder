import type { AggregateRoot, EntityProps } from '@libs/common/domain'

import type { TMapper } from '../types'

export type TAbstractAggregateRepository<
  A extends AggregateRoot<EntityProps>,
  AbstractPersistenceEntity,
> = {
  mapper: TMapper<A, AbstractPersistenceEntity>
  saveAggregateInDB(aggregate: A): Promise<void>
  restoreAggregateFromDB(aggregateId: string): Promise<A | null>
  deleteAggregateById(aggregateId: string): Promise<void>
}
