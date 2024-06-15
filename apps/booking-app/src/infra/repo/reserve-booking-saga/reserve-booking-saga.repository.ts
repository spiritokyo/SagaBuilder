import type { ReserveBookingSaga } from '@application/usecases/reserve-booking/saga/saga.reserve-booking.orchestrator'

export type TReserveBookingSagaRepository = {
  /**
   *
   * @param reserveBookingSaga
   */
  saveReserveBookingSagaInDB(reserveBookingSaga: ReserveBookingSaga): Promise<void>
  /**
   * @description restore reserve booking aggregate from DB based on `sagaId`
   */
  restoreReserveBookingSagaFromDB(sagaId: string): Promise<ReserveBookingSaga | null>
}
