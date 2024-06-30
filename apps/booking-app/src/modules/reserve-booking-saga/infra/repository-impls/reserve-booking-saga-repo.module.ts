import { Module } from '@nestjs/common'
import type { ReserveBookingDTO } from '@reserve-booking-saga-controller/reserve-booking.dto'
import type { PoolClient } from 'pg'

import type { Booking } from '@booking-domain/booking.aggregate'

import type { BookingPersistenceEntity } from '@booking-infra/persistence-entities'
import { BookingRepoModule } from '@booking-infra/repository-impls'

import { getConnectionToken } from '@libs/common/dynamic-modules/postgres/postgres.helpers'
import type { TAbstractAggregateRepository } from '@libs/common/infra/repo'
import type { TSagaRepo } from '@libs/saga/repo'
import { SagaRepositoryImplDatabase } from '@libs/saga/repo'

import { dbConfig } from '../../../../shared/infra/postgres/config'
import { BookingModule } from '../../../booking/booking.module'

@Module({
  imports: [BookingModule],
  providers: [
    {
      inject: [getConnectionToken(dbConfig.name), BookingRepoModule.BOOKING_REPO_TOKEN],
      provide: ReserveBookingSagaRepoModule.RESERVE_BOOKING_SAGA_REPO_TOKEN,
      useFactory: (
        connection: PoolClient,
        bookingRepository: TAbstractAggregateRepository<Booking, BookingPersistenceEntity>,
      ): TSagaRepo<Booking, ReserveBookingDTO> =>
        new SagaRepositoryImplDatabase<Booking, ReserveBookingDTO, BookingPersistenceEntity>(
          connection,
          bookingRepository,
        ),
    },
  ],
  exports: [ReserveBookingSagaRepoModule.RESERVE_BOOKING_SAGA_REPO_TOKEN],
})
export class ReserveBookingSagaRepoModule {
  static RESERVE_BOOKING_SAGA_REPO_TOKEN = 'RESERVE_BOOKING_SAGA_REPO_TOKEN'
}
