import { BookingDomainService } from '@domain/booking.domain-service'

import { ReserveBookingUsecase } from '@application/usecases/reserve-booking'
import { ReserveBookingSaga } from '@application/usecases/reserve-booking/saga/saga.reserve-booking.orchestrator'

import { ReserveBookingController } from '@infra/controllers/reserve-booking'
import { getConnection } from '@infra/database/client'
import { initializeBookingDomainSubscribers } from '@infra/domain-subscriptions/booking'
import { initializeReserveBookingSagaDomainSubscribers } from '@infra/domain-subscriptions/reserve-booking-saga'
import { RabbitMQClient } from '@infra/rabbit/client'
import { ReserveBookingSagaRepositoryImplDatabase } from '@infra/repo/reserve-booking-saga/repository-impls'

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
