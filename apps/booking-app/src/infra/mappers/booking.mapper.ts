import { Booking } from '@domain/index'

import type { BookingPersistenceEntity } from '@infra/persistence-entities'

import { UniqueEntityID } from '@libs/domain/unique-entity-id'
import type { TMapper } from '@libs/infra'

export class BookingMapper implements TMapper<BookingPersistenceEntity, Booking> {
  public toDomain(bookingPersistenceEntity: BookingPersistenceEntity): Booking {
    return Booking.create(
      {
        customerId: bookingPersistenceEntity.customer_id,
        courseId: bookingPersistenceEntity.course_id,
        email: bookingPersistenceEntity.email,
        bookingState: bookingPersistenceEntity.current_state,
      },
      new UniqueEntityID(bookingPersistenceEntity.id),
    )
  }

  public toPersistence(booking: Booking): BookingPersistenceEntity {
    return {
      id: booking.getId(),
      course_id: booking.getDetails().courseId,
      customer_id: booking.getDetails().customerId,
      current_state: booking.getDetails().bookingState,
      email: booking.getDetails().email,
    }
  }
}
