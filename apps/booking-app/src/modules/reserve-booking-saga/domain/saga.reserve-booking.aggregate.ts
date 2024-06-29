import type { Booking } from '@booking-domain/booking.aggregate'

import { SagaManager } from '@libs/saga/index'

export class ReserveBookingSaga extends SagaManager<Booking> {}
