import { Booking } from '@booking-domain/index'

import type { BookingPersistenceEntity } from '@booking-infra/persistence-entities'

import { UniqueEntityID } from '@libs/domain/unique-entity-id'
import type { TMapper } from '@libs/infra'

export class BookingMapper implements TMapper<BookingPersistenceEntity, Booking> {
  public toDomain(bookingPersistenceEntity: BookingPersistenceEntity): Booking {
    return Booking.create(
      {
        customerId: bookingPersistenceEntity.customer_id,
        courseId: bookingPersistenceEntity.course_id,
        paymentId: bookingPersistenceEntity.payment_id,
        email: bookingPersistenceEntity.email,
        bookingState: bookingPersistenceEntity.current_state,
        isFrozen: bookingPersistenceEntity.is_frozen,
      },
      new UniqueEntityID(bookingPersistenceEntity.id),
    )
  }

  public toPersistence(booking: Booking): BookingPersistenceEntity {
    return {
      id: booking.getId(),
      customer_id: booking.getDetails().customerId,
      course_id: booking.getDetails().courseId,
      payment_id: booking.getDetails().paymentId,
      current_state: booking.getDetails().bookingState,
      is_frozen: booking.getDetails().isFrozen,
      email: booking.getDetails().email,
    }
  }
}
