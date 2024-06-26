import type { ReserveBookingDTO } from '@reserve-booking-saga-controller/reserve-booking.dto'

import type { Booking } from '@booking-domain/booking.aggregate'

import { SagaManager } from '@libs/saga/index'

export class ReserveBookingSaga extends SagaManager<Booking, ReserveBookingDTO> {}
