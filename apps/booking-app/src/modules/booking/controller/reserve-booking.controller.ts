import type { Request, Response } from 'express'

import { DomainBookingErrors } from '@booking-domain/index'

import type { ReserveBookingUsecase } from '@reserve-booking-saga-application/usecases'

import { BaseController } from '@libs/infra'

import type { ReserveBookingDTO } from './reserve-booking.dto'
import { ReserveBookingErrors } from './reserve-booking.errors'

export class ReserveBookingController extends BaseController {
  constructor(private usecase: ReserveBookingUsecase) {
    super()
  }

  async executeImpl(req: Request, res: Response): Promise<Response> {
    // TODO: add validation 1
    const dto: ReserveBookingDTO = {
      customerId: req.body.customerId,
      courseId: req.body.courseId,
      email: req.body.email as string,
    }

    const result = await this.usecase.execute(dto)

    if (result instanceof Error) {
      // Saga successfully was compensated
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

      // Error during compensation transaction - we should freeze saga with error status
      return this.fail(
        res,
        (result as DomainBookingErrors.ExceptionAbortCreateBookingTransaction).message,
      )
    }

    return this.ok(res, result)
  }
}
