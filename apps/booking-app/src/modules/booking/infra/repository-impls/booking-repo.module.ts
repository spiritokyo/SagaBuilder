import { Module } from '@nestjs/common'
import type { PoolClient } from 'pg'

import { dbConfig } from '@shared/infra/postgres/config'

import { getConnectionToken } from '@libs/common/dynamic-modules/postgres/postgres.helpers'

import { BookingRepositoryImplDatabase } from './booking.repository-impl.database'

@Module({
  providers: [
    {
      inject: [getConnectionToken(dbConfig.name)],
      provide: BookingRepoModule.BOOKING_REPO_TOKEN,
      useFactory: (connection: PoolClient): BookingRepositoryImplDatabase =>
        new BookingRepositoryImplDatabase(connection),
    },
  ],
  exports: [BookingRepoModule.BOOKING_REPO_TOKEN],
})
export class BookingRepoModule {
  static BOOKING_REPO_TOKEN = 'BOOKING_REPO_TOKEN'
}
