export class AuthorizePaymentCardCommand {
  constructor(
    public readonly bookingId: string,
    public readonly customerId: number,
  ) {}
}

export class CheckCourseAvailabilityCommand {
  constructor(public readonly courseId: number) {}
}
