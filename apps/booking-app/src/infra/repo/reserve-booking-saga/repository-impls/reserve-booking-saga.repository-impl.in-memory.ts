import { ReserveBookingSaga } from '@application/usecases/reserve-booking/saga/saga.reserve-booking.orchestrator'

import { ReserveBookingSagaMapper } from '@infra/mappers'

import { Booking } from '@domain/index'

import type { TBookingRepository } from '@infra/repo/booking'
import { BookingRepositoryImplInMemory } from '@infra/repo/booking'

import type { ReserveBookingSagaPersistenceEntity } from '@infra/persistence-entities'

import type { TReserveBookingSagaRepository } from '../reserve-booking-saga.repository'

const sagaBookingEntitiesInMemory: ReserveBookingSagaPersistenceEntity[] = []

export class ReserveBookingSagaRepositoryImplInMemory implements TReserveBookingSagaRepository {
  private static reserveBookingSagaMapper: ReserveBookingSagaMapper
  private static bookingRepo: TBookingRepository

  private constructor() {}

  /**
   * @description Initialize BookingRepository, ReserveBookingSaga mapper and ReserveBookingSagaRepository
   */
  static initialize(): TReserveBookingSagaRepository {
    this.bookingRepo = new BookingRepositoryImplInMemory()
    this.reserveBookingSagaMapper = new ReserveBookingSagaMapper(this.bookingRepo)

    return new ReserveBookingSagaRepositoryImplInMemory()
  }

  async saveReserveBookingSagaInDB(
    reserveBookingSaga: ReserveBookingSaga,
    isNew: boolean,
  ): Promise<void> {
    // emulateChaosError(new SagaBookingRepoInfraError(), 10)

    /**
     * * 1. Save child booking aggregate
     * * 2. Save saga itself
     */

    if (isNew) {
      // 1
      await ReserveBookingSagaRepositoryImplInMemory.bookingRepo.saveBookingInDB(
        reserveBookingSaga.props.booking,
      )
    }

    // Convert aggregate into persistence entity
    const reserveBookingSagaPersistenceEntity =
      ReserveBookingSagaRepositoryImplInMemory.reserveBookingSagaMapper.toPersistence(
        reserveBookingSaga,
      )

    const idx = sagaBookingEntitiesInMemory.findIndex(
      (saga) => saga.id === reserveBookingSagaPersistenceEntity.id,
    )

    // 2
    if (idx === -1) {
      sagaBookingEntitiesInMemory.push(reserveBookingSagaPersistenceEntity)
    } else {
      sagaBookingEntitiesInMemory[idx] = reserveBookingSagaPersistenceEntity
    }

    await Promise.resolve()
  }

  async restoreReserveBookingSagaFromDB(sagaId: string): Promise<ReserveBookingSaga | null> {
    // emulateChaosError(new SagaBookingRepoInfraError(), 10)

    // Get persistence entity from in-memory database
    const reserveBookingSagaPersistenceEntity =
      sagaBookingEntitiesInMemory.find((saga) => saga.id === sagaId) || null

    return await Promise.resolve(
      reserveBookingSagaPersistenceEntity
        ? ReserveBookingSagaRepositoryImplInMemory.reserveBookingSagaMapper.toDomain(
            reserveBookingSagaPersistenceEntity,
          )
        : null,
    )
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
