import type { Request, Response } from 'express'

import { DomainBookingErrors } from '@booking-domain/index'

import type { ReserveBookingUsecase } from '@reserve-booking-saga-application/usecases/reserve-booking'

import { BaseController } from '@libs/infra'

import type { ReserveBookingDTO } from './reserve-booking.dto'
import { ReserveBookingErrors } from './reserve-booking.errors'

export class ReserveBookingController extends BaseController {
  constructor(private usecase: ReserveBookingUsecase) {
    super()
    this.usecase = usecase
  }

  async executeImpl(req: Request, res: Response): Promise<Response> {
    const dto: ReserveBookingDTO = {
      customerId: req.body.customerId,
      courseId: req.body.courseId,
      email: req.body.email as string,
    }

    const result = await this.usecase.execute(dto)

    // console.log('🚀 ~ ReserveBookingController ~ executeImpl ~ result:', result)

    if (result instanceof Error) {
      // 4. Saga successfully was compensated
      if (
        result instanceof ReserveBookingErrors.BookingRepoInfraError ||
        result instanceof ReserveBookingErrors.BookingPaymentInfraError ||
        result instanceof DomainBookingErrors.BookingCreatedFailureDomainError ||
        result instanceof DomainBookingErrors.BookingConfirmFailureDomainError
      ) {
        return this.wrongInput(res, {
          booking: result.extractBookingInfo(),
          payment:
            result instanceof ReserveBookingErrors.BookingPaymentInfraError
              ? result.extractPaymentInfo()
              : null,
          reason: result.message,
        })
      }

      // 5. Error during compensation transaction - we should freeze saga with error status
      return this.fail(
        res,
        (result as DomainBookingErrors.ExceptionAbortCreateBookingTransaction).message,
      )

      // TODO: handle error related with publishing domain events
    }

    return this.ok(res, result)
  }
}