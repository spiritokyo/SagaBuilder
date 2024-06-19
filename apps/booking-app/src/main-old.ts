import express from 'express'

import { initializeBookingRouter } from '@booking-infra/router'

import { initializeInfra, handleErrors } from '@shared/others'

/**
 * Initialize all infrastructure
 */
const bookingController = await initializeInfra()
const v1Router = initializeBookingRouter(bookingController)

const app = express()

app.use(express.json())
app.use('/', v1Router)

const server = app.listen(3000, () => {
  console.log('Express is .listening on port 3000 (Booking service)...')
})

handleErrors(server)
