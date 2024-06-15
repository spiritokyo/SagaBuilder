/* eslint-disable no-restricted-syntax */

import { ReserveBookingErrors } from '@booking-controller/index'
import type { PoolClient } from 'pg'

import type { Booking } from '@booking-domain/index'

import { BookingMapper } from '@booking-infra/mapper'
import type { BookingPersistenceEntity } from '@booking-infra/persistence-entities'

import { emulateChaosError } from '@libs/infra/error/utils'

import type { TBookingRepository } from '../booking.repository'

export class BookingRepositoryImplDatabase implements TBookingRepository {
  private mapper = new BookingMapper()

  constructor(public readonly client: PoolClient) {}

  async saveBookingInDB(booking: Booking): Promise<void> {
    const bookingPersistenceEntity = this.mapper.toPersistence(booking)

    // emulateChaosError(new ReserveBookingErrors.BookingRepoInfraError(bookingPersistenceEntity), 10)

    // @ts-expect-error for debug
    const res = await this.client.query(
      `
      INSERT INTO "Booking" ("id", "customer_id", "course_id", "payment_id", "email", "current_state") 
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT ("id")
      DO UPDATE
      SET
        "payment_id" = $4,
        "current_state" = $6
      RETURNING *
        `,
      [
        bookingPersistenceEntity.id,
        bookingPersistenceEntity.customer_id,
        bookingPersistenceEntity.course_id,
        bookingPersistenceEntity.payment_id,
        bookingPersistenceEntity.email,
        bookingPersistenceEntity.current_state,
      ],
    )

    // console.log('DB SAVE BOOKING')
    // console.table({
    //   payload: res.rows[0],
    // })
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
