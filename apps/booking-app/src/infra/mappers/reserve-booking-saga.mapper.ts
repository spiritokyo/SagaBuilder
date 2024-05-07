import type { TMapper } from '@libs/infra'

import type { ReserveBookingSagaPersistenceEntity } from '@infra/persistence-entities'

import type { TBookingRepository } from '@infra/repo/booking'

import { UniqueEntityID } from '@libs/domain'

import { ReserveBookingSaga } from '../../application/usecases/reserve-booking/saga/saga.reserve-booking.orchestrator'

export class ReserveBookingSagaMapper
  implements TMapper<ReserveBookingSagaPersistenceEntity, ReserveBookingSaga>
{
  constructor(private bookingRepository: TBookingRepository) {}

  async toDomain(
    reserveBookingSagaPersistenceEntity: ReserveBookingSagaPersistenceEntity,
  ): Promise<ReserveBookingSaga> {
    const { id, state } = reserveBookingSagaPersistenceEntity.props

    const booking = await this.bookingRepository.restoreBookingFromDB(id)

    if (!booking) {
      throw new Error('Booking not found')
    }

    return ReserveBookingSaga.create(
      {
        booking,
        state: {
          isErrorSaga: state.is_error_saga,
          completedStep: state.completed_step,
          isCompensatingDirection: state.is_compensating_direction,
        },
      },
      new UniqueEntityID(reserveBookingSagaPersistenceEntity.id),
    )
  }

  toPersistence(domainEntity: ReserveBookingSaga): ReserveBookingSagaPersistenceEntity {
    return {
      id: domainEntity.getId(),
      props: {
        id: domainEntity.props.booking.id.toString(),
        state: {
          is_error_saga: domainEntity.getState().isErrorSaga,
          completed_step: domainEntity.getState().completedStep,
          is_compensating_direction: domainEntity.getState().isCompensatingDirection,
        },
      },
    }
  }
}
