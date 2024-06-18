import { BookingDomainService } from '@booking-domain/booking.domain-service'
import type { Booking } from '@booking-domain/index'

import { ReserveBookingSaga } from '@reserve-booking-saga-domain/index'

import { ReserveBookingUsecase } from '@reserve-booking-saga-application/usecases'

import { ReserveBookingController } from '@booking-controller/index'

import { initializeBookingDomainSubscribers } from '@booking-infra/domain-subscriptions'
import type { BookingPersistenceEntity } from '@booking-infra/persistence-entities'
import { BookingRepositoryImplDatabase } from '@booking-infra/repository-impls'

import { RestoreFailedReserveBookingSagaCron } from '@reserve-booking-saga-infra/crons'
import { initializeReserveBookingSagaDomainSubscribers } from '@reserve-booking-saga-infra/domain-subscriptions'

import { getConnection } from '@shared/infra/database/client'
import { RabbitMQClient } from '@shared/infra/rabbit/client'

import { SagaRepositoryImplDatabase } from '@libs/saga/repo'

export async function initializeInfra(): Promise<ReserveBookingController> {
  // Initialize postgresql connection
  const connection = await getConnection()

  // Initialize message broker
  const messageBroker = await RabbitMQClient.initialize()

  // Initialize domain subscribers
  initializeBookingDomainSubscribers()
  initializeReserveBookingSagaDomainSubscribers(connection)

  // Initialize repository implementations
  const bookingRepository = new BookingRepositoryImplDatabase(connection)
  const reserveBookingSagaRepository = SagaRepositoryImplDatabase.initialize<
    Booking,
    BookingPersistenceEntity
  >(connection, bookingRepository)

  // Initialize & run cron
  RestoreFailedReserveBookingSagaCron.initialize(connection, reserveBookingSagaRepository).run()

  // Initialize ReserveBookingSaga aggregate
  ReserveBookingSaga.initialize(reserveBookingSagaRepository, messageBroker)

  // Initialize usecase
  const reserveBookingUsecase = ReserveBookingUsecase.initialize(
    new BookingDomainService(),
    reserveBookingSagaRepository,
  )

  // Initialize controller
  const bookingController = new ReserveBookingController(reserveBookingUsecase)

  return bookingController
}
