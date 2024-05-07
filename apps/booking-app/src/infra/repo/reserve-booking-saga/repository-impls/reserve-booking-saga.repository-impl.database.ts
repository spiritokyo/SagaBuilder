import { ReserveBookingSaga } from '@application/usecases/reserve-booking/saga/saga.reserve-booking.orchestrator'

import { ReserveBookingSagaMapper } from '@infra/mappers'

import { Booking } from '@domain/index'

import type { TBookingRepository } from '@infra/repo/booking'
import { BookingRepositoryImplDatabase } from '@infra/repo/booking'

import type { PoolClient } from 'pg'

import type { ReserveBookingSagaPersistenceEntity } from '@infra/persistence-entities'

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
    isNew: boolean,
  ): Promise<void> {
    // emulateChaosError(new SagaBookingRepoInfraError(), 10)

    /**
     * 1. Save child booking aggregate (on creating)
     * 2. Save saga itself
     */

    if (isNew) {
      // 1
      await ReserveBookingSagaRepositoryImplDatabase.bookingRepo.saveBookingInDB(
        reserveBookingSaga.props.booking,
      )
    }

    const reserveBookingSagaPersistenceEntity =
      ReserveBookingSagaRepositoryImplDatabase.reserveBookingSagaMapper.toPersistence(
        reserveBookingSaga,
      )

    console.log('DB SAVE SAGA:', reserveBookingSagaPersistenceEntity)

    // 2
    await this.client.query(
      `
        INSERT INTO "ReserveBookingSaga" ("id", "state") VALUES ($1, $2)
        ON CONFLICT ("id")
        DO UPDATE
        SET
          "state" = $2
        RETURNING *
        `,
      [
        reserveBookingSagaPersistenceEntity.id,
        JSON.stringify(reserveBookingSagaPersistenceEntity.props.state),
      ],
    )
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

  createReserveBookingSaga(data: {
    customerId: string
    courseId: string
    email: string
  }): ReserveBookingSaga {
    const booking = Booking.create(data)

    return ReserveBookingSaga.create({ booking })
  }
}
