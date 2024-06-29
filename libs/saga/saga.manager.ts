/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unnecessary-condition */
/* eslint-disable @typescript-eslint/prefer-reduce-type-parameter */
import type { RabbitMQClient } from '@booking-shared/infra/rabbit/client'
import type { ReserveBookingDTO } from '@reserve-booking-saga-controller/reserve-booking.dto'
import EventEmitter from 'node:events'

import type { EntityProps, UniqueEntityID } from '@libs/common/domain'
import { AggregateRoot } from '@libs/common/domain'

import type { TSagaRepository } from './repo/saga.repository'
import type {
  AbstractProps,
  GenericSagaStateProps,
  ISagaManager,
  SagaStepClass,
  TEventClass,
} from './saga.types'

export class SagaManager<
    A extends AggregateRoot<EntityProps>,
    TCustomProps extends AbstractProps<A> = AbstractProps<A>,
  >
  extends AggregateRoot<GenericSagaStateProps>
  implements ISagaManager
{
  static sagaRepository: TSagaRepository<AggregateRoot<EntityProps>>
  static _isInitialized = false

  readonly eventBus: EventEmitter
  readonly completedEvent: TEventClass
  readonly failedEvent: TEventClass

  name: string
  successfulSteps: InstanceType<SagaStepClass>[]
  steps: InstanceType<SagaStepClass>[]
  stepsMap: Record<string, InstanceType<SagaStepClass>>

  public props: TCustomProps

  /**
   * @description before creating of ReserveBookingSaga, it should be initialized
   */
  public constructor(
    props: TCustomProps,
    events: { completedEvent: TEventClass; failedEvent: TEventClass },
    stepCommands: {
      stepClass: SagaStepClass<NonNullable<AbstractProps<A>['childAggregate']>>
      additionalArguments?: any[]
    }[],
    name: string,
    additional?: { id?: UniqueEntityID },
  ) {
    super(props, additional?.id)

    this.props = props

    this.eventBus = new EventEmitter()
    this.completedEvent = events.completedEvent
    this.failedEvent = events.failedEvent

    this.name = name
    this.steps = stepCommands.map(({ stepClass, additionalArguments }) =>
      additionalArguments
        ? // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          new stepClass(this.eventBus, ...additionalArguments)
        : new stepClass(this.eventBus),
    )
    this.stepsMap = SagaManager.initializeStepsMap(this.steps)

    this.successfulSteps = SagaManager.restoreSuccessfullSteps(
      this.steps,
      this.stepsMap,
      this.props.state.completedStep,
    )

    this.listenUpdateSagaState()
  }

  /**
   * @description Initialize ReserveBookingSagaRepository and RabbitMQ client
   */
  static initialize<A extends AggregateRoot<EntityProps>>(
    sagaRepository: TSagaRepository<A>,
    // messageBroker: RabbitMQClient,
  ): void {
    SagaManager.sagaRepository = sagaRepository

    console.log('[ReserveBookingSaga]: initialized')

    SagaManager._isInitialized = true
  }

  static initializeStepsMap(
    steps: InstanceType<SagaStepClass>[],
  ): Record<string, InstanceType<SagaStepClass>> {
    return steps.reduce(
      (acc, cur) => {
        // @ts-expect-error ...
        if (cur.constructor?.STEP_NAME) {
          // @ts-expect-error ...
          acc[(cur.constructor as SagaStepClass).STEP_NAME] = cur
        }

        // @ts-expect-error ...
        if (cur.constructor?.STEP_NAME_COMPENSATION) {
          // @ts-expect-error ...
          acc[(cur.constructor as SagaStepClass).STEP_NAME_COMPENSATION] = cur
        }

        return acc
      },
      {} as Record<string, InstanceType<SagaStepClass>>,
    )
  }

  static restoreSuccessfullSteps(
    steps: InstanceType<SagaStepClass>[],
    stepsMap: Record<string, InstanceType<SagaStepClass>>,
    lastSuccessfullStep: keyof typeof SagaManager.prototype.stepsMap,
  ): InstanceType<SagaStepClass>[] {
    const lastSuccessfullStepClass = stepsMap[lastSuccessfullStep] as
      | InstanceType<SagaStepClass>
      | undefined

    if (!lastSuccessfullStepClass) {
      return []
    }

    return steps.slice(
      0,
      steps.findIndex((stepClass) => stepClass instanceof lastSuccessfullStepClass.constructor),
    )
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
      stepCommands: {
        stepClass: SagaStepClass
        additionalArguments?: any[]
      }[],
      name: string,
      additional?: { id?: UniqueEntityID },
    ) => ReturnClass,
    props: {
      childAggregate: AbstractProps<A>['childAggregate'] | null
      state?: GenericSagaStateProps['state']
    },
    events: { completedEvent: TEventClass; failedEvent: TEventClass },
    stepCommands: {
      stepClass: SagaStepClass
      additionalArguments?: any[]
    }[],
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
      }

      //* Create brand new saga instance
      return new this(
        { childAggregate: null, state: initialState },
        events,
        stepCommands,
        name,
        additional,
      )
    }

    //* Restore existing saga from DB
    console.log('[RESTORE EXISTING SAGA]', props, additional?.id)
    return new this(
      { childAggregate: props.childAggregate, state: props.state },
      events,
      stepCommands,
      name,
      additional,
    )
  }

  async freezeSaga(): Promise<void> {
    this.props.state.isErrorSaga = true

    const event = new this.failedEvent(this.getId(), this.getState())
    this.addDomainEvent(event)

    await this.saveSagaInDB(false)
  }

  async switchToCompensatingDirection(): Promise<void> {
    // We already are in compensation mode
    if (this.props.state.isCompensatingDirection) {
      return
    }

    console.log('[Saga]: switchToCompensatingDirection')
    this.props.state.isCompensatingDirection = true

    await this.saveSagaInDB(true)
  }

  async compeleteSaga(): Promise<void> {
    this.props.state.isCompleted = true
    this.props.state.isErrorSaga = false

    const event = new this.completedEvent(this.getId(), this.getState())
    this.addDomainEvent(event)

    await this.saveSagaInDB(true)
  }

  listenUpdateSagaState(): void {
    this.eventBus.on('update:saga-state', (newState) => {
      this.props.state.completedStep = newState
    })

    this.eventBus.on('update:child-aggregate-persistence', (childAggregate: A) => {
      this.props.childAggregate = childAggregate
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
  async execute(dto: ReserveBookingDTO): Promise<unknown> {
    console.log('Start booking saga!')

    for (const step of this.steps) {
      try {
        // Start to restore saga
        if (this.getState().isErrorSaga) {
          throw new Error('Back to compensation mode')
        }

        console.info(`[Invoking]: ${step.stepName} ...`)

        await step.invokeUpgraded({
          dto,
          childAggregate: this.props.childAggregate,
        })

        await this.saveSagaInDB(false)

        this.successfulSteps.unshift(step)
      } catch (invokeError) {
        console.log('🚀[Reason to run compensation flow]:', (invokeError as Error).message)

        try {
          await this.switchToCompensatingDirection()

          console.error(`[Failed Step]: ${step.stepName} !!`)

          for (const successfulStep of this.successfulSteps) {
            console.info(`[Rollbacking]: ${successfulStep.stepName} ...`)

            await successfulStep.withCompensationUpgraded({
              dto,
              childAggregate: this.props.childAggregate,
            })

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
          // throw compensateError
        }

        // Original error that has became the reason of failing invoking flow
        // throw invokeError
      }
    }

    await this.compeleteSaga()
    console.info('Order Creation Transaction ended successfuly')

    return {
      childAggregate: this.props.childAggregate?.id.toString() || null,
      ...(this.props.childAggregate?.props || {}),
    }
  }

  getName(): string {
    return this.name
  }
}
