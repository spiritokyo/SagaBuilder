import { RabbitMQModule } from '@booking-shared/infra/rabbit'
import { RabbitMQClient } from '@booking-shared/infra/rabbit/client'
import type { OnModuleInit } from '@nestjs/common'
import { Inject, Module } from '@nestjs/common'
import { PoolClient } from 'pg'

import type { Booking } from '@booking-domain/booking.aggregate'

import { RestoreFailedReserveBookingSagaCron } from '@reserve-booking-saga-infra/crons'
import { initializeReserveBookingSagaDomainSubscribers } from '@reserve-booking-saga-infra/domain-subscriptions'
import { ReserveBookingSagaRepoModule } from '@reserve-booking-saga-infra/repository-impls'

import { getConnectionToken } from '@libs/common/dynamic-modules/postgres/postgres.helpers'
import { TSagaRepo } from '@libs/saga/repo'

import { UsecasesProxyModule } from './application/usecases-proxy.module'
import { ReserveBookingController } from './controller'
import { ReserveBookingSaga } from './domain'
import { dbConfig } from '../../shared/infra/postgres/config'

@Module({
  imports: [UsecasesProxyModule, ReserveBookingSagaRepoModule],
  controllers: [ReserveBookingController],
})
export class ReserveBookingSagaModule implements OnModuleInit {
  constructor(
    @Inject(getConnectionToken(dbConfig.name)) private readonly connection: PoolClient,
    @Inject(RabbitMQModule.RABBITMQ_BOOKING_TOKEN) private readonly messageBroker: RabbitMQClient,
    @Inject(ReserveBookingSagaRepoModule.RESERVE_BOOKING_SAGA_REPO_TOKEN)
    private readonly reserveBookingSagaRepository: TSagaRepo<Booking>,
  ) {}

  onModuleInit(): void {
    // Initialize domain subscribers
    initializeReserveBookingSagaDomainSubscribers(this.connection)

    // Initialize saga aggregate
    ReserveBookingSaga.initialize(this.reserveBookingSagaRepository)

    // Initialize & run cron
    RestoreFailedReserveBookingSagaCron.initialize(
      this.connection,
      this.reserveBookingSagaRepository,
      this.messageBroker,
    ).run()
  }
}
