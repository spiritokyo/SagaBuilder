import type { Booking } from '@domain/index'

import { emulateChaosError } from '@libs/infra/error/utils'

import { ReserveBookingErrors } from '@infra/controllers/reserve-booking'

import { BookingMapper } from '@infra/mappers'

import type { BookingPersistenceEntity } from '@infra/persistence-entities'

import type { TBookingRepository } from '../booking.repository'

const BookingPersistenceEntitiesInMemory: BookingPersistenceEntity[] = []

export class BookingRepositoryImplInMemory implements TBookingRepository {
  private mapper = new BookingMapper()

  async saveBookingInDB(booking: Booking): Promise<void> {
    const bookingPersistenceEntity = this.mapper.toPersistence(booking)

    emulateChaosError(new ReserveBookingErrors.BookingRepoInfraError(bookingPersistenceEntity), 10)

    const id = bookingPersistenceEntity.id

    if (id) {
      const idx = BookingPersistenceEntitiesInMemory.findIndex((entity) => entity.id === id)

      if (idx === -1) {
        BookingPersistenceEntitiesInMemory.push(bookingPersistenceEntity)
      } else {
        BookingPersistenceEntitiesInMemory[idx] = bookingPersistenceEntity
      }
    } else {
      BookingPersistenceEntitiesInMemory.push(bookingPersistenceEntity)
    }

    await Promise.resolve()
  }

  restoreBookingFromDB(bookingId: string): Promise<Booking | null> {
    emulateChaosError(new ReserveBookingErrors.BookingRepoInfraError({ id: bookingId }), 10)

    const bookingPersistenceModel =
      BookingPersistenceEntitiesInMemory.find((booking) => booking.id === bookingId) || null

    return Promise.resolve(
      bookingPersistenceModel ? this.mapper.toDomain(bookingPersistenceModel) : null,
    )
  }

  deleteBookingById(bookingId: string): Promise<void> {
    emulateChaosError(new ReserveBookingErrors.BookingRepoInfraError({ id: bookingId }), 90)

    const result = BookingPersistenceEntitiesInMemory.findIndex(
      (booking) => booking.id === bookingId,
    )

    if (result !== -1) {
      BookingPersistenceEntitiesInMemory.splice(result, 1)
    }

    return Promise.resolve()
  }
}
