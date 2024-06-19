import type { AggregateRoot, EntityProps } from '@libs/domain'

export type TMapper<DomainEntity extends AggregateRoot<EntityProps>, PersistenceEntity> = {
  toDomain(persistenceEntity: PersistenceEntity): Promise<DomainEntity> | DomainEntity
  toPersistence(domainEntity: DomainEntity): PersistenceEntity
}
