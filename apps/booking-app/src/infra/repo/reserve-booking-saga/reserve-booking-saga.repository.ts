import type { ReserveBookingSaga } from '@application/usecases/reserve-booking/saga/saga.reserve-booking.orchestrator'

export type TReserveBookingSagaRepository = {
  /**
   *
   * @param reserveBookingSaga
   * @param isNew - true if we are going to new create reserve booking saga
   * @param isNew - false if we are going to just update reserve booking saga
   */
  saveReserveBookingSagaInDB(reserveBookingSaga: ReserveBookingSaga, isNew: boolean): Promise<void>
  /**
   * @description restore reserve booking aggregate from DB based on `sagaId`
   */
  restoreReserveBookingSagaFromDB(sagaId: string): Promise<ReserveBookingSaga | null>
  /**
   * @description create reserve booking aggregate (in-memory)
   */
  createReserveBookingSaga(data: {
    customerId: string
    courseId: string
    email: string
  }): ReserveBookingSaga
}
