import type { Booking } from '@booking-domain/index'

export type TBookingRepository = {
  saveBookingInDB(booking: Booking): Promise<void>
  restoreBookingFromDB(bookingAggregateId: string): Promise<Booking | null>
  deleteBookingById(bookingAggregateId: string): Promise<void>
}
