import type { ReserveBookingSaga } from '@application/usecases/reserve-booking/saga/saga.reserve-booking.orchestrator'

export type TReserveBookingSagaRepository = {
  /**
   *
   * @param reserveBookingSaga
   * @param updateOnlySagaState - if true, only reserve booking saga state will be updated in DB
   */
  saveReserveBookingSagaInDB(
    reserveBookingSaga: ReserveBookingSaga,
    updateOnlySagaState: boolean,
  ): Promise<void>
  /**
   * @description restore reserve booking aggregate from DB based on `sagaId`
   */
  restoreReserveBookingSagaFromDB(sagaId: string): Promise<ReserveBookingSaga | null>
}
