export enum BookingState {
  CREATING_PENDING = 'CREATING_PENDING',
  PAYMENT_PENDING = 'PAYMENT_PENDING',
  APPROVAL_PENDING = 'APPROVAL_PENDING',
  CANCEL_PENDING = 'CANCEL_PENDING',
  CONFIRMED = 'CONFIRMED',
  REJECTED = 'REJECTED',
  // We can't rollback the saga
  ERROR = 'ERROR',
}
