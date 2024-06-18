import type { AggregateRoot, EntityProps } from '@libs/domain'

export type TAbstractAggregateRepository<A extends AggregateRoot<EntityProps>> = {
  saveAggregateInDB(aggregate: A): Promise<void>
  restoreAggregateFromDB(aggregateId: string): Promise<A | null>
  deleteAggregateById(aggregateId: string): Promise<void>
}
