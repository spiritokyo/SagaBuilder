import type { EventEmitter } from 'node:events'

import type { UniqueEntityID } from '@libs/common/domain'
import type { TEventClass, SagaStepClass } from '@libs/saga/saga.types'

import { ReserveBookingSaga } from './saga.reserve-booking.aggregate'
import {
  ReserveBookingSagaCompletedDomainEvent,
  ReserveBookingSagaFailedDomainEvent,
} from './saga.reserve-booking.events'
import { AuthorizePaymentStep, ConfirmBookingStep } from './steps'
import { RegisterTicketOnBookingCourseStep } from './steps/register-ticket-on-booking-course.step'

export const reserveBookingSagaConfig: [
  events: { completedEvent: TEventClass; failedEvent: TEventClass },
  stepCommands: ((eventBus: EventEmitter) => InstanceType<SagaStepClass>)[],
  name: string,
] = [
  {
    completedEvent: ReserveBookingSagaCompletedDomainEvent,
    failedEvent: ReserveBookingSagaFailedDomainEvent,
  },
  [
    (eventBus: EventEmitter): RegisterTicketOnBookingCourseStep =>
      new RegisterTicketOnBookingCourseStep(eventBus),
    // (eventBus: EventEmitter): AuthorizePaymentStep =>
    //   new AuthorizePaymentStep(eventBus, ReserveBookingSaga.messageBroker),
    // (eventBus: EventEmitter): ConfirmBookingStep => new ConfirmBookingStep(eventBus),
  ],
  'ReserveBookingSaga',
]
