import type { ReserveBookingDTO } from '@reserve-booking-saga-controller/index'
import type { EventEmitter } from 'node:events'

import { Booking } from '@booking-domain/index'
import type { MaybeErrorResponse, BookingDomainService } from '@booking-domain/index'

import type { ReserveBookingSagaResult } from '@reserve-booking-saga-domain/index'
import {
  ReserveBookingSaga,
  ReserveBookingSagaCompletedDomainEvent,
  ReserveBookingSagaFailedDomainEvent,
} from '@reserve-booking-saga-domain/index'
import {
  CreateBookingStep,
  AuthorizePaymentStep,
  ConfirmBookingStep,
} from '@reserve-booking-saga-domain/steps'

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
      { childAggregate: Booking.create(dto) },
      {
        completedEvent: ReserveBookingSagaCompletedDomainEvent,
        failedEvent: ReserveBookingSagaFailedDomainEvent,
      },
      [
        (eventBus: EventEmitter): CreateBookingStep => new CreateBookingStep(eventBus),
        (eventBus: EventEmitter): AuthorizePaymentStep =>
          new AuthorizePaymentStep(eventBus, ReserveBookingSaga.messageBroker),
        (eventBus: EventEmitter): ConfirmBookingStep => new ConfirmBookingStep(eventBus),
      ],
      'ReserveBookingSaga',
    )

    // 2. Save saga instance
    await ReserveBookingUsecase.reserveBookingSagaRepository.saveSagaInDB(reserveBookingSaga, false)

    // 3. Run saga execution (RPC)
    return await this.bookingDomainService.reserveBooking(reserveBookingSaga)
  }
}
