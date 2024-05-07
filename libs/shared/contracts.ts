export type TChannelsUnion = 'channelPayment' | 'channelBookingSagaReplyTo' | 'channelBookingCDC'

export const CONTRACTS_QUEUES = {
  Q_PAYMENT: 'q.payment',
  Q_NOTIFICATION: 'q.notification',
  Q_BOOKING_CDC: 'q.booking.cdc',
  Q_BOOKING_SAGA_REPLY_TO_SUCCESS_PAYMENT: 'q.booking-saga-reply-success-payment',
  Q_BOOKING_SAGA_REPLY_TO_FAILED_PAYMENT: 'q.booking-saga-reply-failed-payment',
} as const

export const CONTRACTS_EXCHANGES = {
  EX_BOOKING_CDC: 'ex.booking.cdc',
} as const

export const CONTRACTS_ROUTING_KEYS = {
  CMD_PAYMENT_AUTHORIZE_CARD: 'cmd.payment.authorize-card',
  CMD_NOTIFICATION_SUCCESS_BOOKING: 'cmd.notification.success-booking',
  CMD_SAGA_REPLY_TO_SUCCESS_PAYMENT: 'cmd.saga-reply-to.succcess-payment',
  CMD_SAGA_REPLY_TO_FAILED_PAYMENT: 'cmd.saga-reply-to.failed-payment',
  CMD_BOOKING_CDC: 'cmd.booking.cdc',
} as const

export const bindings: { channel: TChannelsUnion; queue: string }[] = [
  {
    channel: 'channelPayment',
    // exchange: this.exchangePayment.exchange,
    queue: CONTRACTS_QUEUES.Q_PAYMENT,
    // routingKey: Q_CONTRACTS_ROUTING_KEYS.CMD_PAYMENT_AUTHORIZE_CARD,
  },
  // TODO: add refund payment
  // Saga
  {
    channel: 'channelBookingSagaReplyTo',
    // exchange: this.exchangeBookingSagaReplyTo.exchange,
    queue: CONTRACTS_QUEUES.Q_BOOKING_SAGA_REPLY_TO_SUCCESS_PAYMENT,
    // routingKey: Q_CONTRACTS_ROUTING_KEYS.CMD_SAGA_REPLY_TO_SUCCESS_PAYMENT,
  },
  {
    channel: 'channelBookingSagaReplyTo',
    // exchange: this.exchangeBookingSagaReplyTo.exchange,
    queue: CONTRACTS_QUEUES.Q_BOOKING_SAGA_REPLY_TO_FAILED_PAYMENT,
    // routingKey: Q_CONTRACTS_ROUTING_KEYS.CMD_SAGA_REPLY_TO_FAILED_PAYMENT,
  },
  {
    channel: 'channelBookingCDC',
    queue: CONTRACTS_QUEUES.Q_BOOKING_CDC,
  },
] as const
