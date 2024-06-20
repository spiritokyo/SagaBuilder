/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

// import { BookingRepositoryImplDatabase } from '@booking-infra/repository-impls'

export async function initializeInfra() {
  // Initialize domain subscribers
  // initializeBookingDomainSubscribers()
  // initializeReserveBookingSagaDomainSubscribers(connection)
  // Initialize repository implementations (X)
  // const bookingRepository = new BookingRepositoryImplDatabase(connection)
  // const reserveBookingSagaRepository = SagaRepositoryImplDatabase.initialize<
  //   Booking,
  //   BookingPersistenceEntity
  // >(connection, bookingRepository)
  // Initialize & run cron
  // RestoreFailedReserveBookingSagaCron.initialize(connection, reserveBookingSagaRepository).run()
  // Initialize ReserveBookingSaga aggregate
  // ReserveBookingSaga.initialize(reserveBookingSagaRepository, messageBroker)
}
