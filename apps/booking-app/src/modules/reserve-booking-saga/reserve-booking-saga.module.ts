import { Module } from '@nestjs/common'

import { UsecasesProxyModule } from './application/usecases-proxy.module'
import { ReserveBookingController } from './controller'

@Module({
  imports: [UsecasesProxyModule],
  controllers: [ReserveBookingController],
})
export class ReserveBookingSagaModule {}
