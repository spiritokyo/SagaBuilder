import type { PoolClient } from 'pg'

import type { ReserveBookingSaga } from '@application/usecases/reserve-booking/saga/saga.reserve-booking.aggregate'

import { ReserveBookingSagaMapper } from '@infra/mappers'
import type { ReserveBookingSagaPersistenceEntity } from '@infra/persistence-entities'
import type { TBookingRepository } from '@infra/repo/booking'
import { BookingRepositoryImplDatabase } from '@infra/repo/booking'

import type { TReserveBookingSagaRepository } from '../reserve-booking-saga.repository'

export class ReserveBookingSagaRepositoryImplDatabase implements TReserveBookingSagaRepository {
  private static reserveBookingSagaMapper: ReserveBookingSagaMapper
  private static bookingRepo: TBookingRepository

  constructor(public readonly client: PoolClient) {}

  /**
   * @description Initialize BookingRepository, ReserveBookingSaga mapper and ReserveBookingSagaRepository
   */
  static initialize(client: PoolClient): TReserveBookingSagaRepository {
    this.bookingRepo = new BookingRepositoryImplDatabase(client)
    this.reserveBookingSagaMapper = new ReserveBookingSagaMapper(this.bookingRepo)

    console.log('[ReserveBookingSagaRepositoryImplDatabase]: initialized')

    return new ReserveBookingSagaRepositoryImplDatabase(client)
  }

  async saveReserveBookingSagaInDB(
    reserveBookingSaga: ReserveBookingSaga,
    updateOnlySagaState: boolean,
  ): Promise<void> {
    // emulateChaosError(new SagaBookingRepoInfraError(), 10)

    /**
     * 1. Save child booking aggregate
     * 2. Save saga itself
     */

    // 1
    if (reserveBookingSaga.isBookingPersisted && !updateOnlySagaState) {
      await ReserveBookingSagaRepositoryImplDatabase.bookingRepo.saveBookingInDB(
        reserveBookingSaga.props.booking,
      )
    }

    const reserveBookingSagaPersistenceEntity =
      ReserveBookingSagaRepositoryImplDatabase.reserveBookingSagaMapper.toPersistence(
        reserveBookingSaga,
      )

    // 2
    // @ts-expect-error for debug
    const res = await this.client.query(
      `
        INSERT INTO "ReserveBookingSaga" ("id", "bookingId", "state") VALUES ($1, $2, $3)
        ON CONFLICT ("id")
        DO UPDATE
        SET
          "bookingId" = $2,
          "state" = $3
        RETURNING *
        `,
      [
        reserveBookingSagaPersistenceEntity.id,
        reserveBookingSaga.isBookingPersisted
          ? reserveBookingSagaPersistenceEntity.bookingId
          : null,
        JSON.stringify(reserveBookingSagaPersistenceEntity.state),
      ],
    )

    // console.log('SAVE SAGA DB')
    // console.table({
    //   isBookingPersisted: reserveBookingSaga.isBookingPersisted,
    //   payload: JSON.stringify(res.rows[0], null, 2),
    // })
  }

  async restoreReserveBookingSagaFromDB(sagaId: string): Promise<ReserveBookingSaga | null> {
    // emulateChaosError(new SagaBookingRepoInfraError(), 10)

    const res = await this.client.query(
      `
      SELECT * FROM "ReserveBookingSaga" WHERE id = "$1"
      `,
      [sagaId],
    )

    const reserveBookingSagaPersistenceEntity: ReserveBookingSagaPersistenceEntity | null =
      res.rows[0] || null

    return reserveBookingSagaPersistenceEntity
      ? await ReserveBookingSagaRepositoryImplDatabase.reserveBookingSagaMapper.toDomain(
          reserveBookingSagaPersistenceEntity,
        )
      : null
  }
}
