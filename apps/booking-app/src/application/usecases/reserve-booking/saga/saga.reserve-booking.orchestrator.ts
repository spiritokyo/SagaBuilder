import EventEmitter from 'node:events'

import type { UniqueEntityID } from '@libs/domain'
import { AggregateRoot } from '@libs/domain'

import type { RabbitMQClient } from '@infra/rabbit/client'

import type { TReserveBookingSagaRepository } from '@infra/repo/reserve-booking-saga'

import type { Booking } from '@domain/index'

import type { SagaStep, TSagaStateUnion } from './saga.types'
import { CreateBookingStep, AuthorizePaymentStep, ConfirmBookingStep } from './steps'

export type ReserveBookingSagaResult = {
  booking: {
    bookingId: string
    customerId: string
    courseId: string
    email: string
  }
  payment: { paymentId: string | null }
}

export type ReserveBookingSagaProps = {
  booking: Booking
  state: {
    completedStep: TSagaStateUnion
    isCompensatingDirection: boolean
    isErrorSaga: boolean
  }
}

export class ReserveBookingSaga extends AggregateRoot<ReserveBookingSagaProps> {
  static reserveBookingSagaRepository: TReserveBookingSagaRepository
  static messageBroker: RabbitMQClient
  private static _isInitialized = false

  private readonly eventBus: EventEmitter

  private readonly step1: CreateBookingStep
  private readonly step2: AuthorizePaymentStep
  private readonly step3: ConfirmBookingStep

  private successfulSteps: SagaStep<Booking, unknown>[] = []
  private steps: SagaStep<Booking, unknown>[]

  /**
   * @description before creating of ReserveBookingSaga, it should be initialized
   */
  private constructor(props: ReserveBookingSagaProps, id?: UniqueEntityID) {
    super(props, id)

    this.eventBus = new EventEmitter()

    this.listenUpdateSagaState()

    this.step1 = new CreateBookingStep(this.eventBus)
    this.step2 = new AuthorizePaymentStep(this.eventBus, ReserveBookingSaga.messageBroker)
    this.step3 = new ConfirmBookingStep(this.eventBus)
    this.steps = [this.step1, this.step2, this.step3]
  }

  /**
   * @description create in-memory ReserveBookingSaga instance
   */
  static create(
    props: Pick<ReserveBookingSagaProps, 'booking'> & {
      state?: ReserveBookingSagaProps['state']
    },
    id?: UniqueEntityID,
  ): ReserveBookingSaga {
    if (!ReserveBookingSaga._isInitialized) {
      throw new Error('ReserveBookingSaga is not initialized')
    }

    const initialState: ReserveBookingSagaProps['state'] = {
      completedStep: 'INITIAL' as const,
      isCompensatingDirection: false,
      isErrorSaga: false,
    }

    // TODO: Emit domain event
    // ...

    //* Create brand new saga instance
    return new ReserveBookingSaga({ ...props, state: initialState }, id)
  }

  /**
   * @description Initialize ReserveBookingSagaRepository and RabbitMQ client
   */
  static initialize(
    reserveBookingSagaRepository: TReserveBookingSagaRepository,
    messageBroker: RabbitMQClient,
  ): void {
    ReserveBookingSaga.reserveBookingSagaRepository = reserveBookingSagaRepository
    ReserveBookingSaga.messageBroker = messageBroker

    console.log('[ReserveBookingSaga]: initialized')

    ReserveBookingSaga._isInitialized = true
  }

  async saveSagaInDB(): Promise<void> {
    await ReserveBookingSaga.reserveBookingSagaRepository.saveReserveBookingSagaInDB(this, false)
  }

  async freezeSaga(): Promise<void> {
    this.props.state.isErrorSaga = true

    await this.saveSagaInDB()
  }

  async switchToCompensatingDirection(): Promise<void> {
    console.log('[Saga]: switchToCompensatingDirection')
    this.props.state.isCompensatingDirection = true

    await this.saveSagaInDB()
  }

  /**
   * throws `SagaBookingRepoInfraError` - error during SAGA persistence - CIRCUIT BREAKER
   * throws `BookingRepoInfraError` - error during altering booking (DB) - CIRCUIT BREAKER
   * throws `BookingPaymentInfraError` - error during payment / refunding of booking - CIRCUIT BREAKER
   *
   * throws `BookingCreatedFailureDomainError` - course is not available - THROWS ERROR
   * throws `BookingConfirmFailureDomainError` - error during booking confirmation - THROW ERROR
   */

  async execute(): Promise<ReserveBookingSagaResult> {
    const bookingDetails = this.props.booking.getDetails()

    const sagaResult = {
      payment: { paymentId: null as string | null },
      booking: {
        bookingId: this.props.booking.id.toString(),
        ...bookingDetails,
      },
    }

    console.log('Start new booking saga!')

    for (const step of this.steps) {
      try {
        console.info(`[Invoking]: ${step.name} ...`)

        const stepResult = await step.invoke(this.props.booking)

        // Invoke saga step => update saga state in DB
        await this.saveSagaInDB()

        if (step.name === AuthorizePaymentStep.STEP_NAME) {
          const { paymentId } = stepResult as { paymentId: string }

          sagaResult.payment.paymentId = paymentId
        }

        this.successfulSteps.unshift(step)
      } catch (invokeError) {
        console.log('🚀[Reason to run compensation flow]:', invokeError as Error)

        // Saga in compensation mode => update saga state in DB
        await this.switchToCompensatingDirection()

        console.error(`[Failed Step]: ${step.name} !!`)

        try {
          for (const successfulStep of this.successfulSteps) {
            console.info(`[Rollbacking]: ${successfulStep.name} ...`)

            await successfulStep.withCompensation(this.props.booking)

            // Invoke compensate saga step => update saga state in DB
            await this.saveSagaInDB()
          }
          console.log('Successful end of compensating workflow')
        } catch (compensateError) {
          console.log(
            '[Reason to fail compensation flow]🚀:',
            (compensateError as Error).constructor.name,
          )

          // Compensation saga was broken => freeze saga => update saga state in DB
          await this.freezeSaga()

          // Original error that has became the reason of failing compensation flow
          throw compensateError
        }

        // Original error that has became the reason of failing invoking flow
        throw invokeError
      }
    }
    console.info('Order Creation Transaction ended successfuly')

    return sagaResult
  }

  getId(): string {
    return this.id.toString()
  }

  getBookingEntityId(): string {
    return this.props.booking.id.toString()
  }

  listenUpdateSagaState(): void {
    this.eventBus.on('update:saga-state', (newState) => {
      this.props.state.completedStep = newState
    })
  }

  getState(): ReserveBookingSagaProps['state'] {
    return this.props.state
  }
}
