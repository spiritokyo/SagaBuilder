/* eslint-disable no-restricted-syntax */

import type { PoolClient } from 'pg'

import type { Booking } from '@domain/index'

import { ReserveBookingErrors } from '@infra/controllers/reserve-booking'
import { BookingMapper } from '@infra/mappers'
import type { BookingPersistenceEntity } from '@infra/persistence-entities'

import { emulateChaosError } from '@libs/infra/error/utils'

import type { TBookingRepository } from '../booking.repository'

export class BookingRepositoryImplDatabase implements TBookingRepository {
  private mapper = new BookingMapper()

  constructor(public readonly client: PoolClient) {}

  async saveBookingInDB(booking: Booking): Promise<void> {
    const bookingPersistenceEntity = this.mapper.toPersistence(booking)

    // emulateChaosError(new ReserveBookingErrors.BookingRepoInfraError(bookingPersistenceEntity), 10)

    console.log('DB SAVE BOOKING: ', bookingPersistenceEntity)

    await this.client.query(
      `
      INSERT INTO "Booking" ("id", "customer_id", "course_id", "email") VALUES ($1, $2, $3, $4)
      ON CONFLICT ("id")
      DO UPDATE
      SET
        "customer_id" = $2,
        "course_id" = $3,
        "email" = $4
      RETURNING *
        `,
      [
        bookingPersistenceEntity.id,
        bookingPersistenceEntity.customer_id,
        bookingPersistenceEntity.course_id,
        bookingPersistenceEntity.email,
      ],
    )
  }

  async restoreBookingFromDB(bookingId: string): Promise<Booking | null> {
    // emulateChaosError(new ReserveBookingErrors.BookingRepoInfraError({ id: bookingId }), 10)

    const res = await this.client.query(
      `
      SELECT * FROM "Booking" WHERE id = "$1"
      `,
      [bookingId],
    )

    const bookingPersistenceEntity: BookingPersistenceEntity | null = res.rows[0] || null

    return bookingPersistenceEntity ? this.mapper.toDomain(bookingPersistenceEntity) : null
  }

  async deleteBookingById(bookingId: string): Promise<void> {
    emulateChaosError(new ReserveBookingErrors.BookingRepoInfraError({ id: bookingId }), 90)

    await this.client.query(
      `
      DELETE FROM "Booking" WHERE id = $1
      `,
      [bookingId],
    )
  }
}
