import { Controller, Post, Req, Res } from '@nestjs/common'
import { Request, Response } from 'express'

// import {} from ''
import { DomainBookingErrors } from '@booking-domain/index'

import { ReserveBookingUsecase } from '@reserve-booking-saga-application/usecases'
// import { UsecasesProxyModule } from '@reserve-booking-saga-application/usecases-proxy.module'

import { BaseController } from '@libs/common/infra'

import type { ReserveBookingDTO } from './reserve-booking.dto'
import { ReserveBookingErrors } from './reserve-booking.errors'

@Controller()
export class ReserveBookingController extends BaseController {
  constructor(
    /* @Inject(UsecasesProxyModule.RESERVE_BOOKING_USECASE) */ private usecase: ReserveBookingUsecase,
  ) {
    super()
  }

  @Post('/reserve-booking')
  async reserveBooking(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<Response> {
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
