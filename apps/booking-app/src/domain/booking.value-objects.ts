import type { BookingState } from './booking.state-machine'

export class BookingDetailsVO {
  constructor(
    readonly customerId: string,
    readonly courseId: string,
    readonly email: string,
    readonly bookingState: BookingState,
  ) {}
}
