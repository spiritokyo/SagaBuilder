export type TMapper<PersistenceEntity, DomainEntity> = {
  toDomain(persistenceEntity: PersistenceEntity): Promise<DomainEntity> | DomainEntity
  toPersistence(domainEntity: DomainEntity): PersistenceEntity
}
