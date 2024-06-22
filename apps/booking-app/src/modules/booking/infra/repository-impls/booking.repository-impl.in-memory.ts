import { ReserveBookingErrors } from '@reserve-booking-saga-controller/index'

import type { Booking } from '@booking-domain/index'

import { BookingMapper } from '@booking-infra/mapper'
import type { BookingPersistenceEntity } from '@booking-infra/persistence-entities'

import { emulateChaosError } from '@libs/common/infra/error/utils'
import type { TAbstractAggregateRepository } from '@libs/common/infra/repo'

const BookingPersistenceEntitiesInMemory: BookingPersistenceEntity[] = []

export class BookingRepositoryImplInMemory
  implements TAbstractAggregateRepository<Booking, BookingPersistenceEntity>
{
  public mapper = new BookingMapper()

  async saveAggregateInDB(booking: Booking): Promise<void> {
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

  restoreAggregateFromDB(bookingId: string): Promise<Booking | null> {
    emulateChaosError(new ReserveBookingErrors.BookingRepoInfraError({ id: bookingId }), 10)

    const bookingPersistenceModel =
      BookingPersistenceEntitiesInMemory.find((booking) => booking.id === bookingId) || null

    return Promise.resolve(
      bookingPersistenceModel ? this.mapper.toDomain(bookingPersistenceModel) : null,
    )
  }

  deleteAggregateById(bookingId: string): Promise<void> {
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
