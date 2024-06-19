import type { Booking } from '@booking-domain/booking.aggregate'

import { SagaManager } from '@libs/common/saga'

export class ReserveBookingSaga extends SagaManager<Booking> {
  async freezeSaga(): Promise<void> {
    this.props.childAggregate.freezeBooking()
    await super.freezeSaga()
  }

  getBookingId(): string {
    return this.props.childAggregate.getId()
  }
}
