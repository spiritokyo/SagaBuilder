import { handleErrors, initializeInfra } from '@infra/others'
import { initializeBookingRouter } from '@infra/router'
import express from 'express'

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
