import { Controller, Get } from '@nestjs/common'

import { PaymentAppService } from './payment-app.service'

@Controller()
export class PaymentAppController {
  constructor(private readonly paymentAppService: PaymentAppService) {}

  @Get()
  getHello(): string {
    return this.paymentAppService.getHello()
  }
}
