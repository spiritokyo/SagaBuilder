import type { ReserveBookingDTO } from '@reserve-booking-saga-controller/index'

import type { Booking, MaybeErrorResponse, BookingDomainService } from '@booking-domain/index'

import type { ReserveBookingSagaResult } from '@reserve-booking-saga-domain/index'
import { ReserveBookingSaga, reserveBookingSagaConfig } from '@reserve-booking-saga-domain/index'

import type { UseCase } from '@libs/common/core'
import type { TSagaRepository } from '@libs/saga/repo'

export class ReserveBookingUsecase
  implements UseCase<ReserveBookingDTO, MaybeErrorResponse | ReserveBookingSagaResult>
{
  static reserveBookingSagaRepository: TSagaRepository<Booking>

  private constructor(private bookingDomainService: BookingDomainService) {}

  static initialize(
    bookingDomainService: BookingDomainService,
    reserveBookingSagaRepository: TSagaRepository<Booking>,
  ): ReserveBookingUsecase {
    ReserveBookingUsecase.reserveBookingSagaRepository = reserveBookingSagaRepository

    console.log('[ReserveBookingUsecase]: initialized')

    return new ReserveBookingUsecase(bookingDomainService)
  }

  public async execute(
    dto: ReserveBookingDTO,
  ): Promise<MaybeErrorResponse | ReserveBookingSagaResult> {
    // 1. Create saga instance
    const reserveBookingSaga = ReserveBookingSaga.create<Booking>(
      { childAggregate: null },
      ...reserveBookingSagaConfig,
    )
    console.log('🚀 ~ reserveBookingSaga:', reserveBookingSaga)

    // 2. Save saga instance
    await ReserveBookingUsecase.reserveBookingSagaRepository.saveSagaInDB(reserveBookingSaga, false)

    // 3. Run saga execution (RPC)
    return await this.bookingDomainService.reserveBooking(reserveBookingSaga, dto)
  }
}
