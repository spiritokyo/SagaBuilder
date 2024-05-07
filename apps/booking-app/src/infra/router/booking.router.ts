/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/ban-types */
import type { ReserveBookingController } from '@infra/controllers/reserve-booking'
import { Router } from 'express'

export function initializeBookingRouter(bookingController: ReserveBookingController): Router {
  const v1Router = Router()

  v1Router.post('/reserve-booking', (req, res) => {
    void bookingController.execute(req, res)
  })

  return v1Router
}
