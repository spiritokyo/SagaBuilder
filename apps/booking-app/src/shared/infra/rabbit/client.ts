/* eslint-disable require-atomic-updates */
import { connect } from 'amqplib'
import type { Channel, Connection } from 'amqplib'
import EventEmitter from 'events'

import type {
  AuthorizePaymentCardCommand,
  CheckCourseAvailabilityCommand,
  TChannelsUnion,
} from '@libs/common/shared'
import { rabbitMQConfig } from '@libs/common/shared/constants'

import { BookingCDCConsumerRabbitMQ } from './booking-cdc.consumer'
import { CommandMessagePublisherRabbitMQ } from './command-message.publisher'
import { ReplyCreatingBookingSagaConsumerRabbitMQ } from './reply-saga.consumer'

export class RabbitMQClient {
  public static instance: RabbitMQClient | null = null

  private constructor(
    public eventEmiiter: EventEmitter,
    public clientProducer: CommandMessagePublisherRabbitMQ,
    public sagaReplyConsumer: ReplyCreatingBookingSagaConsumerRabbitMQ,
    public bookingCDCConsumer: BookingCDCConsumerRabbitMQ,
    public channels: Record<TChannelsUnion, Channel>,
    public connection: Connection,
  ) {}

  // TODO: extract rabbitmq config here
  static async initialize(): Promise<RabbitMQClient> {
    try {
      if (RabbitMQClient.instance) {
        return RabbitMQClient.instance
      }

      const connection = await connect(rabbitMQConfig.rabbitMQ.credentials)
      const eventEmiiter = new EventEmitter()

      /**
       * Channels initialization
       */
      const channels: Record<TChannelsUnion, Channel | null> = {
        channelBookingCDC: null,
        channelBookingSagaReplyTo: null,
        channelPayment: null,
        channelCourse: null,
      }

      for (const channel of Object.keys(channels) as TChannelsUnion[]) {
        channels[channel] = await connection.createChannel()
      }

      /**
       * Consumers
       */
      const sagaReplyConsumer = new ReplyCreatingBookingSagaConsumerRabbitMQ(
        channels.channelBookingSagaReplyTo as Channel,
        eventEmiiter,
      )

      const bookingCDCConsumer = new BookingCDCConsumerRabbitMQ(
        channels.channelBookingCDC as Channel,
      )

      /**
       * Producers
       */
      const clientProducer = new CommandMessagePublisherRabbitMQ(
        channels.channelPayment as Channel,
        channels.channelCourse as Channel,
        eventEmiiter,
      )

      /**
       * Initialize client
       */
      const rabbitMQClient = new RabbitMQClient(
        eventEmiiter,
        clientProducer,
        sagaReplyConsumer,
        bookingCDCConsumer,
        channels as Record<TChannelsUnion, Channel>,
        connection,
      )

      /**
       * Register consumer handlers
       */
      await rabbitMQClient.consumeSuccessPaymentBooking()
      await rabbitMQClient.consumeFailurePaymentBooking()
      await rabbitMQClient.consumeCourseAvailability()
      await rabbitMQClient.consumeBookingCDC()

      RabbitMQClient.instance = rabbitMQClient

      console.log('[RabbitMQClient]: initialized')

      return RabbitMQClient.instance
    } catch (err) {
      console.error('[RabbitMQ]', 'error', err)
      throw err
    }
  }

  sendCheckCourseAvailabilityCommand(
    cmd: CheckCourseAvailabilityCommand,
  ): Promise<{ isCourseAvailable: boolean }> {
    return this.clientProducer.sendCheckCourseAvailabilityCommand(cmd)
  }

  sendAuthorizeCardCommand(
    cmd: AuthorizePaymentCardCommand,
  ): Promise<{ authorizedPayment: boolean; paymentId: number }> {
    return this.clientProducer.sendAuthorizeCardCommand(cmd)
  }

  sendAuthorizeRefundCardCommand(
    cmd: AuthorizePaymentCardCommand,
  ): Promise<{ authorizedPayment: boolean; paymentId: number }> {
    return this.clientProducer.sendAuthorizeRefundCardCommand(cmd)
  }

  async consumeSuccessPaymentBooking(): Promise<void> {
    return await this.sagaReplyConsumer.consumeSuccessPaymentBooking()
  }

  async consumeFailurePaymentBooking(): Promise<void> {
    return await this.sagaReplyConsumer.consumeFailurePaymentBooking()
  }

  async consumeCourseAvailability(): Promise<void> {
    return await this.sagaReplyConsumer.consumeCourseAvailability()
  }

  async consumeBookingCDC(): Promise<void> {
    return await this.bookingCDCConsumer.publishDomainEvents()
  }
}
