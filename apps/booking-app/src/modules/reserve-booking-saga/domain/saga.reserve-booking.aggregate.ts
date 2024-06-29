import type { ReserveBookingDTO } from '@reserve-booking-saga-controller/reserve-booking.dto'

import type { Booking } from '@booking-domain/booking.aggregate'

import { SagaManager } from '@libs/saga/index'

export class ReserveBookingSaga extends SagaManager<Booking> {
  async freezeSaga(): Promise<void> {
    this.props.childAggregate?.freezeBooking()
    await super.freezeSaga()
  }

  getBookingId(): string | undefined {
    return this.props.childAggregate?.getId()
  }
}
