import { BookingDomainService } from '@booking-domain/booking.domain-service'

import { ReserveBookingSaga } from '@reserve-booking-saga-domain/index'

import { ReserveBookingUsecase } from '@reserve-booking-saga-application/usecases/reserve-booking'

import { ReserveBookingController } from '@reserve-booking-saga-controller/index'

import { initializeBookingDomainSubscribers } from '@booking-infra/domain-subscriptions'

import { initializeReserveBookingSagaDomainSubscribers } from '@reserve-booking-saga-infra/domain-subscriptions'
import { ReserveBookingSagaRepositoryImplDatabase } from '@reserve-booking-saga-infra/repo/repository-impls'

import { getConnection } from '@shared/infra/database/client'
import { RabbitMQClient } from '@shared/infra/rabbit/client'

export async function initializeInfra(): Promise<ReserveBookingController> {
  // Initialize domain subscribers
  initializeBookingDomainSubscribers()
  initializeReserveBookingSagaDomainSubscribers()

  // Initialize postgresql connection
  const connection = await getConnection()

  // Initialize message broker
  const messageBroker = await RabbitMQClient.initialize()

  // Initialize repository implementation
  const reserveBookingSagaRepository =
    ReserveBookingSagaRepositoryImplDatabase.initialize(connection)

  // Initialize ReserveBookingSaga aggregate
  ReserveBookingSaga.initialize(reserveBookingSagaRepository, messageBroker)

  // Initialize usecase
  const reserveBookingUsecase = await ReserveBookingUsecase.initialize(
    new BookingDomainService(),
    reserveBookingSagaRepository,
  )

  // Initialize controller
  const bookingController = new ReserveBookingController(reserveBookingUsecase)

  return bookingController
}
