import type { RabbitMQClient } from '@booking-shared/infra/rabbit/client'
import { Module } from '@nestjs/common'
import { RabbitMQModule } from '@payment-infra/rabbit'

import type { Booking } from '@booking-domain/booking.aggregate'

import type { BookingPersistenceEntity } from '@booking-infra/persistence-entities'

import { ReserveBookingSagaRepoModule } from '@reserve-booking-saga-infra/repository-impls'

import type { SagaRepositoryImplDatabase } from '@libs/saga/repo'

import { ReserveBookingUsecase } from './usecases/reserve-booking.usecase'

@Module({
  imports: [ReserveBookingSagaRepoModule],
  providers: [
    {
      inject: [
        ReserveBookingSagaRepoModule.RESERVE_BOOKING_SAGA_REPO_TOKEN,
        RabbitMQModule.RABBITMQ_BOOKING_TOKEN,
      ],
      provide: UsecasesProxyModule.RESERVE_BOOKING_USECASE,
      useFactory: (
        reserveBookingSagaRepository: SagaRepositoryImplDatabase<Booking, BookingPersistenceEntity>,
        messageBroker: RabbitMQClient,
      ): ReserveBookingUsecase =>
        new ReserveBookingUsecase(reserveBookingSagaRepository, messageBroker),
    },
  ],
  exports: [UsecasesProxyModule.RESERVE_BOOKING_USECASE],
})
export class UsecasesProxyModule {
  static RESERVE_BOOKING_USECASE = 'RESERVE_BOOKING_USECASE'
}
