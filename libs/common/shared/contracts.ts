export type TChannelsUnion =
  | 'channelCourse'
  | 'channelPayment'
  | 'channelBookingSagaReplyTo'
  | 'channelBookingCDC'

export const CONTRACTS_QUEUES = {
  Q_COURSE: 'q.course',
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
  CMD_CHECK_COURSE_AVAILABILITY: 'cmd.check-course-availability',
  CMD_PAYMENT_AUTHORIZE_CARD: 'cmd.payment.authorize-card',
  CMD_NOTIFICATION_SUCCESS_BOOKING: 'cmd.notification.success-booking',
  CMD_SAGA_REPLY_TO_SUCCESS_PAYMENT: 'cmd.saga-reply-to.succcess-payment',
  CMD_SAGA_REPLY_TO_FAILED_PAYMENT: 'cmd.saga-reply-to.failed-payment',
  CMD_BOOKING_CDC: 'cmd.booking.cdc',
} as const

export const bindings: { channel: TChannelsUnion; queue: string }[] = [
  {
    channel: 'channelCourse',
    queue: CONTRACTS_QUEUES.Q_COURSE,
  },
  {
    channel: 'channelPayment',
    queue: CONTRACTS_QUEUES.Q_PAYMENT,
  },
  {
    channel: 'channelBookingSagaReplyTo',
    queue: CONTRACTS_QUEUES.Q_BOOKING_SAGA_REPLY_TO_SUCCESS_PAYMENT,
  },
  {
    channel: 'channelBookingSagaReplyTo',
    queue: CONTRACTS_QUEUES.Q_BOOKING_SAGA_REPLY_TO_FAILED_PAYMENT,
  },
  {
    channel: 'channelBookingCDC',
    queue: CONTRACTS_QUEUES.Q_BOOKING_CDC,
  },
] as const
