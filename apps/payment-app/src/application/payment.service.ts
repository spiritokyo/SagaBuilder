import type { AuthorizePaymentCardCommand } from '@libs/common/shared/commands'

export class PaymentService {
  async runPayment(_cmd: AuthorizePaymentCardCommand): Promise<{
    authorizedPayment: boolean
    paymentId: number | null
  }> {
    const isCustomerBanned = Math.random() > 0.9

    console.log('🚀 PaymentService: isCustomerBanned:', isCustomerBanned)

    // Mock
    return await Promise.resolve({
      // eslint-disable-next-line no-unneeded-ternary
      authorizedPayment: isCustomerBanned ? false : true,
      paymentId: 666,
    })
  }
}
