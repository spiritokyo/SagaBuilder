import { handleErrors, initializeInfra } from '@booking-shared/others'
import { NestFactory } from '@nestjs/core'
import type { Server } from 'http'

// import { handleErrors, initializeInfra } from '@shared/others'

import { AppModule } from './app.module'

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule)
  const server: Server = await app.listen(3000, () => {
    console.log('Server is listening on port 3000 (Booking service)...')
  })

  // TODO: FIX
  handleErrors(server)
  await initializeInfra()
}

void bootstrap()
