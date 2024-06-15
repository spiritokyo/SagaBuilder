import { Booking } from '@booking-domain/index'
import type { MaybeErrorResponse, BookingDomainService } from '@booking-domain/index'

import type { ReserveBookingSagaResult } from '@reserve-booking-saga-domain/index'
import { ReserveBookingSaga } from '@reserve-booking-saga-domain/index'

import type { ReserveBookingDTO } from '@booking-controller/index'

import type { TReserveBookingSagaRepository } from '@reserve-booking-saga-infra/repo'

import type { UseCase } from '@libs/core'

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
      false,
    )

    // 3. Run saga execution (RPC)
    return await this.bookingDomainService.reserveBooking(reserveBookingSaga)
  }
}
