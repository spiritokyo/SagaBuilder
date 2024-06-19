import { Module } from '@nestjs/common'

import { BookingModule } from './modules/booking/booking.module'
// import { ReserveBookingSagaModule } from './modules/reserve-booking-saga/reserve-booking-saga.module'

@Module({
  imports: [BookingModule /* ReserveBookingSagaModule */],
})
export class AppModule {}
