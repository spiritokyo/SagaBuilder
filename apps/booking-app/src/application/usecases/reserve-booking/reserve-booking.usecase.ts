import { Booking } from '@domain/index'
import type { BookingDomainService, MaybeErrorResponse } from '@domain/index'

import type { ReserveBookingDTO } from '@infra/controllers/reserve-booking'
import type { TReserveBookingSagaRepository } from '@infra/repo/reserve-booking-saga'

import type { UseCase } from '@libs/core'

import { ReserveBookingSaga } from './saga/saga.reserve-booking.orchestrator'
import type { ReserveBookingSagaResult } from './saga/saga.reserve-booking.orchestrator'

export class ReserveBookingUsecase
  implements UseCase<ReserveBookingDTO, MaybeErrorResponse | ReserveBookingSagaResult>
{
  static reserveBookingSagaRepository: TReserveBookingSagaRepository

  private constructor(private bookingDomainService: BookingDomainService) {}

  static async initialize(
    bookingDomainService: BookingDomainService,
    reserveBookingSagaRepository: TReserveBookingSagaRepository,
  ): Promise<ReserveBookingUsecase> {
    ReserveBookingUsecase.reserveBookingSagaRepository = reserveBookingSagaRepository

    console.log('[ReserveBookingUsecase]: initialized')

    return await Promise.resolve(new ReserveBookingUsecase(bookingDomainService))
  }

  public async execute(
    dto: ReserveBookingDTO,
  ): Promise<MaybeErrorResponse | ReserveBookingSagaResult> {
    // 1. Create saga instance
    const reserveBookingSaga = ReserveBookingSaga.create({ booking: Booking.create(dto) })

    // 2. Save saga instance
    await ReserveBookingUsecase.reserveBookingSagaRepository.saveReserveBookingSagaInDB(
      reserveBookingSaga,
    )

    // 3. Run saga execution (RPC)
    return await this.bookingDomainService.reserveBooking(reserveBookingSaga)
  }
}
