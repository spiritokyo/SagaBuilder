/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unnecessary-condition */
/* eslint-disable @typescript-eslint/prefer-reduce-type-parameter */

import type { EntityProps, UniqueEntityID, AggregateRoot } from '@libs/common/domain'

import type { TSagaRepo } from './repo/saga.repository'
import type { SagaStep, SagaStepClassInheritor } from './saga-step'
import { SagaManagerControl } from './saga.manager-control'
import type {
  AbstractProps,
  GenericSagaStateProps,
  SagaCreateOptions,
  TEventClass,
} from './saga.types'

export class SagaManager<
  A extends AggregateRoot<EntityProps>,
  DTO extends Record<string, unknown>,
> {
  static sagaRepo: TSagaRepo<AggregateRoot<EntityProps>, Record<string, unknown>>
  static isInitialized = false

  readonly sagaManagerControl: SagaManagerControl<A, DTO>

  public successfulSteps: SagaStep<A>[]
  public steps: SagaStep<A>[]
  public stepsMap: Record<string, SagaStep<A>>

  /**
   * @description before creating of ReserveBookingSaga, it should be initialized
   */
  public constructor(
    sagaManagerControl: SagaManagerControl<A, DTO>,
    stepCommands: {
      stepClass: SagaStepClassInheritor<A>
      additionalArguments?: any[]
    }[],
  ) {
    this.sagaManagerControl = sagaManagerControl

    this.steps = stepCommands.map(({ stepClass, additionalArguments }) =>
      additionalArguments
        ? // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          new stepClass(this.sagaManagerControl.eventBus, ...additionalArguments)
        : new stepClass(this.sagaManagerControl.eventBus),
    )

    this.stepsMap = SagaManager.initializeStepsMap(this.steps)
    this.successfulSteps = SagaManager.restoreSuccessfullSteps(
      this.steps,
      this.stepsMap,
      this.sagaManagerControl.getState().completedStep,
    )

    this.sagaManagerControl.listenUpdateSagaState()
  }

  /**
   * @description Initialize ReserveBookingSagaRepository and RabbitMQ client
   */
  static initialize<A extends AggregateRoot<EntityProps>, DTO extends Record<string, unknown>>(
    sagaRepo: TSagaRepo<A, DTO>,
  ): void {
    SagaManager.sagaRepo = sagaRepo

    console.log('[ReserveBookingSaga]: initialized')

    SagaManager.isInitialized = true
  }

  /**
   * @description create/reconstruct in-memory ReserveBookingSaga
   */
  static create<
    A extends AggregateRoot<EntityProps>,
    DTO extends Record<string, unknown>,
    SagaManagerInheritor extends SagaManager<A, DTO> = SagaManager<A, DTO>,
  >(
    this: new (
      sagaManagerControl: SagaManagerControl<A, DTO>,
      stepCommands: {
        stepClass: SagaStepClassInheritor<A>
        additionalArguments?: any[]
      }[],
    ) => SagaManagerInheritor,
    options: SagaCreateOptions<A>,
  ): SagaManagerInheritor {
    const { events, name, props, stepCommands, additional } = options

    if (!SagaManager.isInitialized) {
      throw new Error('ReserveBookingSaga is not initialized')
    }

    const initialState: GenericSagaStateProps['state'] | null = props.state
      ? null
      : {
          completedStep: 'INITIAL' as const,
          isCompensatingDirection: false,
          isErrorSaga: false,
          isCompleted: false,
        }

    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    props.state
      ? console.log('[RESTORE EXISTING SAGA]', props, additional?.id)
      : console.log('[BRAND NEW SAGA]', props, additional?.id)

    const sagaManagerControl = new SagaManagerControl<A, DTO>(
      SagaManager.sagaRepo as TSagaRepo<A, DTO>,
      {
        ...props,
        state: initialState ? initialState : props.state,
      } as AbstractProps<A>,
      events,
      name,
      additional,
    )

    return new this(sagaManagerControl, stepCommands)
  }

  /**
   * @description create/reconstruct in-memory ReserveBookingSaga and then to persist it
   */
  static async createAndPersist<
    A extends AggregateRoot<EntityProps>,
    DTO extends Record<string, unknown>,
  >(args: Parameters<typeof SagaManager.create<A, DTO>>): Promise<SagaManager<A, DTO>> {
    const sagaInstance: SagaManager<A, DTO> = SagaManager.create(...args)

    await SagaManager.sagaRepo.saveSagaInDB(sagaInstance, false)

    return sagaInstance
  }

  static initializeStepsMap<A extends AggregateRoot<Record<string, unknown>>>(
    steps: SagaStep<A>[],
  ): Record<string, SagaStep<A>> {
    return steps.reduce(
      (acc, cur) => {
        // @ts-expect-error ...
        if (cur.constructor?.STEP_NAME) {
          // @ts-expect-error ...
          acc[cur.constructor.STEP_NAME] = cur
        }

        // @ts-expect-error ...
        if (cur.constructor?.STEP_NAME_COMPENSATION) {
          // @ts-expect-error ...
          acc[cur.constructor.STEP_NAME_COMPENSATION] = cur
        }

        return acc
      },
      {} as Record<string, SagaStep<A>>,
    )
  }

  static restoreSuccessfullSteps<A extends AggregateRoot<Record<string, unknown>>>(
    steps: SagaStep<A>[],
    stepsMap: Record<string, SagaStep<A>>,
    lastSuccessfullStep: keyof typeof SagaManager.prototype.stepsMap,
  ): SagaStep<A>[] {
    const lastSuccessfullStepClass = stepsMap[lastSuccessfullStep]

    if (!lastSuccessfullStepClass) {
      return []
    }

    return steps.slice(
      0,
      steps.findIndex((stepClass) => stepClass instanceof lastSuccessfullStepClass.constructor),
    )
  }

  /**
   * @throws `SagaBookingRepoInfraError` - error during SAGA persistence - CIRCUIT BREAKER
   * @throws `BookingRepoInfraError` - error during altering booking (DB) - CIRCUIT BREAKER
   * @throws `BookingPaymentInfraError` - error during payment / refunding of booking - CIRCUIT BREAKER
   *
   * @throws `BookingCreatedFailureDomainError` - course is not available - THROWS ERROR
   * @throws `BookingConfirmFailureDomainError` - error during booking confirmation - THROW ERROR
   */
  async execute(dto: DTO): Promise<unknown> {
    console.log('Start booking saga!')

    for (const step of this.steps) {
      try {
        // Start to restore saga
        if (this.sagaManagerControl.getState().isErrorSaga) {
          throw new Error('Back to compensation mode')
        }

        console.info(`[Invoking]: ${step.stepName} ...`)

        await step.invokeUpgraded({
          dto,
          childAggregate: this.sagaManagerControl.props.childAggregate,
        })

        await this.sagaManagerControl.saveSagaInDB(this, false)

        this.successfulSteps.unshift(step)
      } catch (invokeError) {
        console.log('🚀[Reason to run compensation flow]:', (invokeError as Error).message)

        try {
          await this.sagaManagerControl.switchToCompensatingDirection(this)

          console.error(`[Failed Step]: ${step.stepName} !!`)

          for (const successfulStep of this.successfulSteps) {
            console.info(`[Rollbacking]: ${successfulStep.stepName} ...`)

            await successfulStep.withCompensationUpgraded({
              dto,
              childAggregate: this.sagaManagerControl.props.childAggregate,
            })

            await this.sagaManagerControl.saveSagaInDB(this, false)
          }

          await this.sagaManagerControl.compeleteSaga(this)
          console.log('Successful end of compensating workflow')
        } catch (compensateError) {
          console.log(
            '[Reason to fail compensation flow]🚀:',
            (compensateError as Error).constructor.name,
          )

          await this.sagaManagerControl.freezeSaga(this)

          // Original error that has became the reason of failing compensation flow
          // throw compensateError
        }

        // Original error that has became the reason of failing invoking flow
        // throw invokeError
      }
    }

    await this.sagaManagerControl.compeleteSaga(this)
    console.info('Order Creation Transaction ended successfuly')

    return {
      childAggregate: this.sagaManagerControl.props.childAggregate?.id.toString() || null,
      ...(this.sagaManagerControl.props.childAggregate?.props || {}),
    }
  }
}
