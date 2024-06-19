import type { TestingModule } from '@nestjs/testing'
import { Test } from '@nestjs/testing'

import { PaymentAppController } from './payment-app.controller'
import { PaymentAppService } from './payment-app.service'

describe('PaymentAppController', () => {
  let paymentAppController: PaymentAppController

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [PaymentAppController],
      providers: [PaymentAppService],
    }).compile()

    paymentAppController = app.get<PaymentAppController>(PaymentAppController)
  })

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(paymentAppController.getHello()).toBe('Hello World!')
    })
  })
})
