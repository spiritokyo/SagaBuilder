import { Module } from '@nestjs/common'

import type { Booking } from '@booking-domain/booking.aggregate'
import { BookingDomainService } from '@booking-domain/index'

import type { BookingPersistenceEntity } from '@booking-infra/persistence-entities'

import { ReserveBookingSagaRepoModule } from '@reserve-booking-saga-infra/repository-impls'

import type { SagaRepositoryImplDatabase } from '@libs/saga/repo'

import { ReserveBookingUsecase } from './usecases/reserve-booking.usecase'

@Module({
  imports: [ReserveBookingSagaRepoModule],
  providers: [
    {
      inject: [ReserveBookingSagaRepoModule.RESERVE_BOOKING_SAGA_REPO_TOKEN],
      provide: UsecasesProxyModule.RESERVE_BOOKING_USECASE,
      useFactory: (
        reserveBookingSagaRepository: SagaRepositoryImplDatabase<Booking, BookingPersistenceEntity>,
      ): ReserveBookingUsecase =>
        ReserveBookingUsecase.initialize(new BookingDomainService(), reserveBookingSagaRepository),
    },
  ],
  exports: [UsecasesProxyModule.RESERVE_BOOKING_USECASE],
})
export class UsecasesProxyModule {
  static RESERVE_BOOKING_USECASE = 'RESERVE_BOOKING_USECASE'
}
