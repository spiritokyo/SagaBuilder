import { Module } from '@nestjs/common'
import type { PoolClient } from 'pg'

import type { Booking } from '@booking-domain/booking.aggregate'

import type { BookingPersistenceEntity } from '@booking-infra/persistence-entities'
import { BookingRepoModule } from '@booking-infra/repository-impls'

import { dbConfig } from '@shared/infra/postgres/config'

import { getConnectionToken } from '@libs/common/dynamic-modules/postgres/postgres.helpers'
import type { TAbstractAggregateRepository } from '@libs/common/infra/repo'
import type { TSagaRepository } from '@libs/common/saga/repo'
import { SagaRepositoryImplDatabase } from '@libs/common/saga/repo'

@Module({
  imports: [BookingRepoModule],
  providers: [
    {
      inject: [ReserveBookingSagaRepoModule.BOOKING_REPO_TOKEN, getConnectionToken(dbConfig.name)],
      provide: ReserveBookingSagaRepoModule.RESERVE_BOOKING_SAGA_REPO_TOKEN,
      useFactory: (
        connection: PoolClient,
        bookingRepository: TAbstractAggregateRepository<Booking, BookingPersistenceEntity>,
      ): TSagaRepository<Booking> =>
        SagaRepositoryImplDatabase.initialize<Booking, BookingPersistenceEntity>(
          connection,
          bookingRepository,
        ),
    },
  ],
  exports: [ReserveBookingSagaRepoModule.RESERVE_BOOKING_SAGA_REPO_TOKEN],
})
export class ReserveBookingSagaRepoModule {
  static BOOKING_REPO_TOKEN = 'BOOKING_REPO_TOKEN'
  static RESERVE_BOOKING_SAGA_REPO_TOKEN = 'RESERVE_BOOKING_SAGA_REPO_TOKEN'
}
