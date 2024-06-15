import type { EventEmitter } from 'node:stream'

import type { CreateBookingStep, AuthorizePaymentStep, ConfirmBookingStep } from './steps'

export type SagaStep<Params> = {
  name: string
  eventBus: EventEmitter

  invoke(params: Params): Promise<void>
  withCompensation(params: Params): Promise<void>
}

export type TSagaStateUnion =
  | 'INITIAL'
  | typeof CreateBookingStep.STEP_NAME
  | typeof AuthorizePaymentStep.STEP_NAME
  | typeof ConfirmBookingStep.STEP_NAME