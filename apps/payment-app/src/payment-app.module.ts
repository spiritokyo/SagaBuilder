import { Module } from '@nestjs/common'

import { PaymentAppController } from './payment-app.controller'
import { PaymentAppService } from './payment-app.service'

@Module({
  imports: [],
  controllers: [PaymentAppController],
  providers: [PaymentAppService],
})
export class PaymentAppModule {}
