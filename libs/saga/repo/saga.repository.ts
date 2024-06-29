import type EventEmitter from 'node:events'

import type { AggregateRoot, EntityProps, UniqueEntityID } from '@libs/common/domain'

import type { SagaManager } from '../saga.manager'
import type {
  AbstractProps,
  SagaPersistenceEntity,
  SagaStepClass,
  TEventClass,
} from '../saga.types'

export type TSagaRepo<A extends AggregateRoot<EntityProps>> = {
  /**
   *
   * @param reserveBookingSaga
   * @param updateOnlySagaState - if true, only reserve booking saga state will be updated in DB
   */
  saveSagaInDB(saga: SagaManager<A>, updateOnlySagaState: boolean): Promise<void>
  /**
   * @description restore reserve booking aggregate from DB based on `sagaId`
   */
  restoreSaga(
    reserveBookingSagaPersistenceEntity: SagaPersistenceEntity | null,
    events: { completedEvent: TEventClass; failedEvent: TEventClass },
    stepCommands: {
      stepClass: SagaStepClass
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      additionalArguments?: any[]
    }[],
    name: string,
    additional?: {
      id?: UniqueEntityID
    },
  ): Promise<SagaManager<A> | null>
}
