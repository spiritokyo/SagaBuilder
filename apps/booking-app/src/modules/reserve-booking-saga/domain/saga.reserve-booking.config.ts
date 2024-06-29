// import type { EventEmitter } from 'node:events'

// import type { UniqueEntityID } from '@libs/common/domain'
// import type { TEventClass, SagaStepClass } from '@libs/saga/saga.types'

// import { ReserveBookingSaga } from './saga.reserve-booking.aggregate'
// import {
//   ReserveBookingSagaCompletedDomainEvent,
//   ReserveBookingSagaFailedDomainEvent,
// } from './saga.reserve-booking.events'
// import { AuthorizePaymentStep, ConfirmBookingStep } from './steps'
// import { RegisterTicketOnBookingCourseStep } from './steps/register-ticket-on-booking-course.step'

// export const reserveBookingSagaConfig: [
//   events: { completedEvent: TEventClass; failedEvent: TEventClass },
//   stepCommands: ((eventBus: EventEmitter) => InstanceType<SagaStepClass>)[],
//   name: string,
// ] = [
//   {
//     completedEvent: ReserveBookingSagaCompletedDomainEvent,
//     failedEvent: ReserveBookingSagaFailedDomainEvent,
//   },
//   [
//     // Step 1
//     {
//       stepClass: RegisterTicketOnBookingCourseStep,
//     },
//     // Step 2
//     {
//       stepClass: CheckCourseAvailabilityStep,
//       additionalArguments: [this.messageBroker],
//     },
//     // Step 3
//     {
//       stepClass: AuthorizePaymentStep,
//       additionalArguments: [this.messageBroker],
//     },
//     // Step 4
//     {
//       stepClass: ConfirmBookingStep,
//     },
//   ],
//   'ReserveBookingSaga',
// ]
