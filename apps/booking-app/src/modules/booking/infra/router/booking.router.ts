/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/ban-types */
import { Router } from 'express'
import type { ReserveBookingController } from '@reserve-booking-saga-controller/index'

export function initializeBookingRouter(bookingController: ReserveBookingController): Router {
  const v1Router = Router()

  v1Router.post('/reserve-booking', (req, res) => {
    void bookingController.execute(req, res)
  })

  return v1Router
}
