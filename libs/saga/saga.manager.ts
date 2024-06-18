/* eslint-disable @typescript-eslint/method-signature-style */
/* eslint-disable @typescript-eslint/no-explicit-any */

import EventEmitter from 'node:events'

import type { EntityProps, UniqueEntityID } from '@libs/domain'
import { AggregateRoot } from '@libs/domain'

import type { TSagaRepository } from './repo/saga.repository'
import type {
  AbstractProps,
  GenericSagaStateProps,
  ISagaManager,
  SagaStep,
  TEventClass,
} from './saga.types'
import type { RabbitMQClient } from '../../apps/booking-app/src/shared/infra/rabbit/client'

export class SagaManager<
    A extends AggregateRoot<EntityProps>,
    TCustomProps extends AbstractProps<A> = AbstractProps<A>,
  >
  extends AggregateRoot<GenericSagaStateProps>
  implements ISagaManager
{
  static messageBroker: RabbitMQClient
  static sagaRepository: TSagaRepository<AggregateRoot<EntityProps>>
  static _isInitialized = false

  readonly eventBus: EventEmitter
  readonly completedEvent: TEventClass
  readonly failedEvent: TEventClass

  name: string
  successfulSteps: SagaStep<AggregateRoot<Record<string, unknown>>>[]
  steps: SagaStep<AggregateRoot<Record<string, unknown>>>[]

  public props: TCustomProps

  /**
   * @description before creating of ReserveBookingSaga, it should be initialized
   */
  public constructor(
    props: TCustomProps,
    events: { completedEvent: TEventClass; failedEvent: TEventClass },
    stepCommands: ((eventBus: EventEmitter) => SagaStep<AbstractProps['childAggregate']>)[],
    name: string,
    additional?: { id?: UniqueEntityID },
  ) {
    super(props, additional?.id)

    this.props = props

    this.eventBus = new EventEmitter()
    this.completedEvent = events.completedEvent
    this.failedEvent = events.failedEvent

    this.name = name
    this.steps = stepCommands.map((stepCommand) => stepCommand(this.eventBus))
    this.successfulSteps = []

    this.listenUpdateSagaState()
  }

  /**
   * @description Initialize ReserveBookingSagaRepository and RabbitMQ client
   */
  static initialize<A extends AggregateRoot<EntityProps>>(
    sagaRepository: TSagaRepository<A>,
    messageBroker: RabbitMQClient,
  ): void {
    SagaManager.messageBroker = messageBroker
    SagaManager.sagaRepository = sagaRepository

    console.log('[ReserveBookingSaga]: initialized')

    SagaManager._isInitialized = true
  }

  /**
   * @description create/reconstruct in-memory ReserveBookingSaga instance
   */
  static create<
    A extends AggregateRoot<EntityProps>,
    ReturnClass extends SagaManager<A> = SagaManager<A>,
  >(
    this: new (
      props: AbstractProps<A>,
      events: { completedEvent: TEventClass; failedEvent: TEventClass },
      stepCommands: ((eventBus: EventEmitter) => SagaStep<AbstractProps['childAggregate']>)[],
      name: string,
      additional?: { id?: UniqueEntityID },
    ) => ReturnClass,
    props: {
      childAggregate: AbstractProps<A>['childAggregate']
      state?: GenericSagaStateProps['state']
    },
    events: { completedEvent: TEventClass; failedEvent: TEventClass },
    stepCommands: ((eventBus: EventEmitter) => SagaStep<AbstractProps<A>['childAggregate']>)[],
    name: string,
    additional?: {
      id?: UniqueEntityID
    },
  ): ReturnClass {
    if (!SagaManager._isInitialized) {
      throw new Error('ReserveBookingSaga is not initialized')
    }

    if (!props.state) {
      console.log('[CREATE NEW SAGA]', props, additional?.id)

      const initialState: GenericSagaStateProps['state'] = {
        completedStep: 'INITIAL' as const,
        isCompensatingDirection: false,
        isErrorSaga: false,
        isCompleted: false,
        isChildAggregatePersisted: false,
      }

      //* Create brand new saga instance
      return new this({ ...props, state: initialState }, events, stepCommands, name, additional)
    }

    //* Restore existing saga from DB
    console.log('[RESTORE EXISTING SAGA]', props, additional?.id)
    return new this({ ...props, state: props.state }, events, stepCommands, name, additional)
  }

  async freezeSaga(): Promise<void> {
    this.props.state.isErrorSaga = true

    const event = new this.failedEvent(this.getId(), this.getState())
    this.addDomainEvent(event)

    await this.saveSagaInDB(false)
  }

  async switchToCompensatingDirection(): Promise<void> {
    console.log('[Saga]: switchToCompensatingDirection')
    this.props.state.isCompensatingDirection = true

    await this.saveSagaInDB(true)
  }

  async compeleteSaga(): Promise<void> {
    this.props.state.isCompleted = true

    const event = new this.completedEvent(this.getId(), this.getState())
    this.addDomainEvent(event)

    await this.saveSagaInDB(true)
  }

  listenUpdateSagaState(): void {
    this.eventBus.on('update:saga-state', (newState) => {
      this.props.state.completedStep = newState
    })

    this.eventBus.on('update:child-aggregate-persistence', (isChildAggregatePersisted) => {
      this.props.state.isChildAggregatePersisted = isChildAggregatePersisted
    })
  }

  getState(): AbstractProps['state'] {
    return this.props.state
  }

  getId(): string {
    return this.id.toString()
  }

  async saveSagaInDB(updateOnlySagaState: boolean): Promise<void> {
    await SagaManager.sagaRepository.saveSagaInDB(this, updateOnlySagaState)
  }

  /**
   * @throws `SagaBookingRepoInfraError` - error during SAGA persistence - CIRCUIT BREAKER
   * @throws `BookingRepoInfraError` - error during altering booking (DB) - CIRCUIT BREAKER
   * @throws `BookingPaymentInfraError` - error during payment / refunding of booking - CIRCUIT BREAKER
   *
   * @throws `BookingCreatedFailureDomainError` - course is not available - THROWS ERROR
   * @throws `BookingConfirmFailureDomainError` - error during booking confirmation - THROW ERROR
   */
  async execute(): Promise<unknown> {
    console.log('Start new booking saga!')

    for (const step of this.steps) {
      try {
        console.info(`[Invoking]: ${step.name} ...`)

        await step.invoke(this.props.childAggregate)

        await this.saveSagaInDB(false)

        this.successfulSteps.unshift(step)
      } catch (invokeError) {
        console.log('🚀[Reason to run compensation flow]:', (invokeError as Error).message)

        await this.switchToCompensatingDirection()

        console.error(`[Failed Step]: ${step.name} !!`)

        try {
          for (const successfulStep of this.successfulSteps) {
            console.info(`[Rollbacking]: ${successfulStep.name} ...`)

            await successfulStep.withCompensation(this.props.childAggregate)

            await this.saveSagaInDB(false)
          }

          await this.compeleteSaga()
          console.log('Successful end of compensating workflow')
        } catch (compensateError) {
          console.log(
            '[Reason to fail compensation flow]🚀:',
            (compensateError as Error).constructor.name,
          )

          await this.freezeSaga()

          // Original error that has became the reason of failing compensation flow
          throw compensateError
        }

        // Original error that has became the reason of failing invoking flow
        throw invokeError
      }
    }

    await this.compeleteSaga()
    console.info('Order Creation Transaction ended successfuly')

    return {
      childAggregate: this.props.childAggregate.id.toString(),
      ...this.props.childAggregate.props,
    }
  }

  getName(): string {
    return this.name
  }
}
