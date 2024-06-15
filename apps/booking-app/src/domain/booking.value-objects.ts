import type { BookingState } from './booking.state-machine'

export class BookingDetailsVO {
  constructor(
    readonly customerId: number,
    readonly courseId: number,
    readonly paymentId: number | null,
    readonly email: string,
    readonly bookingState: BookingState,
    readonly isFrozen: boolean,
  ) {}
}
