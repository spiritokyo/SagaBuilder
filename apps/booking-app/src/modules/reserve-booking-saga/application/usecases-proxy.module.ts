import { Module } from '@nestjs/common'
import type { DynamicModule } from '@nestjs/common'

import type { Booking } from '@booking-domain/booking.aggregate'
import { BookingDomainService } from '@booking-domain/index'

import type { BookingPersistenceEntity } from '@booking-infra/persistence-entities'

import { ReserveBookingSagaRepoModule } from '@reserve-booking-saga-infra/repository-impls'

import { SagaRepositoryImplDatabase } from '@libs/common/saga/repo'

import { ReserveBookingUsecase } from './usecases/reserve-booking.usecase'

@Module({
  imports: [ReserveBookingSagaRepoModule],
})
export class UsecasesProxyModule {
  static RESERVE_BOOKING_USECASE = 'RESERVE_BOOKING_USECASE'
  static register(): DynamicModule {
    return {
      module: UsecasesProxyModule,
      providers: [
        {
          inject: [SagaRepositoryImplDatabase<Booking, BookingPersistenceEntity>],
          provide: UsecasesProxyModule.RESERVE_BOOKING_USECASE,
          useFactory: (
            reserveBookingSagaRepository: SagaRepositoryImplDatabase<
              Booking,
              BookingPersistenceEntity
            >,
          ) =>
            ReserveBookingUsecase.initialize(
              new BookingDomainService(),
              reserveBookingSagaRepository,
            ),
        },
      ],
      exports: [UsecasesProxyModule.RESERVE_BOOKING_USECASE],
    }
  }
}
