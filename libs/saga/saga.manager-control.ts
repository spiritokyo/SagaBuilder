import { EventEmitter } from 'node:events'

import type { EntityProps, UniqueEntityID } from '@libs/common/domain'
import { AggregateRoot } from '@libs/common/domain'

import type { TSagaRepo } from './repo'
import type { SagaManager } from './saga.manager'
import type { AbstractProps, GenericSagaStateProps, TEventClass } from './saga.types'

export class SagaManagerControl<
  A extends AggregateRoot<EntityProps>,
  DTO extends Record<string, unknown>,
> extends AggregateRoot<GenericSagaStateProps> {
  readonly sagaRepo: TSagaRepo<AggregateRoot<EntityProps>, Record<string, unknown>>
  readonly eventBus: EventEmitter
  readonly completedEvent: TEventClass
  readonly failedEvent: TEventClass

  public name: string
  public props: AbstractProps<A>

  constructor(
    sagaRepo: TSagaRepo<A, DTO>,
    props: AbstractProps<A>,
    events: { completedEvent: TEventClass; failedEvent: TEventClass },
    name: string,
    additional?: { id?: UniqueEntityID },
  ) {
    super(props, additional?.id)

    this.sagaRepo = sagaRepo
    this.props = props

    this.eventBus = new EventEmitter()
    this.name = name
    this.completedEvent = events.completedEvent
    this.failedEvent = events.failedEvent
  }

  async freezeSaga(saga: SagaManager<A, DTO>): Promise<void> {
    this.getState().isErrorSaga = true

    const event = new this.failedEvent(this.getSagaId(), this.getState())
    this.addDomainEvent(event)

    await this.saveSagaInDB(saga, false)
  }

  async switchToCompensatingDirection(saga: SagaManager<A, DTO>): Promise<void> {
    // We already are in compensation mode
    if (this.getState().isCompensatingDirection) {
      return
    }

    console.log('[Saga]: switchToCompensatingDirection')
    this.getState().isCompensatingDirection = true

    await this.saveSagaInDB(saga, true)
  }

  async compeleteSaga(saga: SagaManager<A, DTO>): Promise<void> {
    this.getState().isCompleted = true
    this.getState().isErrorSaga = false

    const event = new this.completedEvent(this.getSagaId(), this.getState())
    this.addDomainEvent(event)

    await this.saveSagaInDB(saga, true)
  }

  async saveSagaInDB(saga: SagaManager<A, DTO>, updateOnlySagaState: boolean): Promise<void> {
    await this.sagaRepo.saveSagaInDB(saga, updateOnlySagaState)
  }

  listenUpdateSagaState(): void {
    this.eventBus.on('update:saga-state', (newState) => {
      this.getState().completedStep = newState
    })

    this.eventBus.on('update:child-aggregate-persistence', (childAggregate: A) => {
      this.props.childAggregate = childAggregate
    })
  }

  getState(): AbstractProps['state'] {
    return this.props.state
  }

  getSagaId(): string {
    return this.id.toString()
  }

  getName(): string {
    return this.name
  }
}
