export class AuthorizePaymentCardCommand {
  constructor(public readonly bookingId: string, public readonly customerId: string) {}
}
