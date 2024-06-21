import { Module } from '@nestjs/common'

import { PaymentService } from './payment.service'

@Module({
  providers: [
    {
      provide: PaymentService,
      useClass: PaymentService,
    },
  ],
  exports: [PaymentService],
})
export class PaymentModule {}
