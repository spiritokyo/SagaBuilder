import type { AggregateRoot, EntityProps, UniqueEntityID } from '@libs/common/domain'

import type { SagaStepClassInheritor } from '../saga-step'
import type { SagaManager } from '../saga.manager'
import type { SagaPersistenceEntity, TEventClass } from '../saga.types'

export type TSagaRepo<A extends AggregateRoot<EntityProps>, DTO extends Record<string, unknown>> = {
  /**
   *
   * @param reserveBookingSaga
   * @param updateOnlySagaState - if true, only reserve booking saga state will be updated in DB
   */
  saveSagaInDB(saga: SagaManager<A, DTO>, updateOnlySagaState: boolean): Promise<void>
  /**
   * @description restore reserve booking aggregate from DB based on `sagaId`
   */
  restoreSaga(
    reserveBookingSagaPersistenceEntity: SagaPersistenceEntity | null,
    events: { completedEvent: TEventClass; failedEvent: TEventClass },
    stepCommands: {
      stepClass: SagaStepClassInheritor<A>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      additionalArguments?: any[]
    }[],
    name: string,
    additional?: {
      id?: UniqueEntityID
    },
  ): Promise<SagaManager<A, DTO> | null>
}
