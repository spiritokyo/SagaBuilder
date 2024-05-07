/* eslint-disable require-atomic-updates */
import { connect } from 'amqplib'

import type { Channel, Connection } from 'amqplib'

import EventEmitter from 'events'

import { rabbitMQConfig } from '@libs/shared/constants'
import type { AuthorizePaymentCardCommand, TChannelsUnion } from '@libs/shared'

import { CommandMessagePublisherRabbitMQ } from './command-message.publisher'
import { ReplyCreatingBookingSagaConsumerRabbitMQ } from './reply-saga.consumer'
import { BookingCDCConsumerRabbitMQ } from './booking-cdc.consumer'

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

  static async initialize(): Promise<RabbitMQClient> {
    try {
      if (RabbitMQClient.instance) {
        return RabbitMQClient.instance
      }

      const connection = await connect(rabbitMQConfig.rabbitMQ.credentials)
      const eventEmiiter = new EventEmitter()

      const channels: Record<TChannelsUnion, Channel | null> = {
        channelBookingCDC: null,
        channelBookingSagaReplyTo: null,
        channelPayment: null,
      }

      for (const channel of Object.keys(channels) as TChannelsUnion[]) {
        channels[channel] = await connection.createChannel()
      }

      const sagaReplyConsumer = new ReplyCreatingBookingSagaConsumerRabbitMQ(
        channels.channelBookingSagaReplyTo as Channel,
        eventEmiiter,
      )

      const bookingCDCConsumer = new BookingCDCConsumerRabbitMQ(
        channels.channelBookingCDC as Channel,
      )

      const clientProducer = new CommandMessagePublisherRabbitMQ(
        channels.channelPayment as Channel,
        eventEmiiter,
      )

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
      await rabbitMQClient.consumeBookingCDC()

      RabbitMQClient.instance = rabbitMQClient

      console.log('[RabbitMQClient]: initialized')

      return RabbitMQClient.instance
    } catch (err) {
      console.error('[RabbitMQ]', 'error', err)
      throw err
    }
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

  async consumeBookingCDC(): Promise<void> {
    return await this.bookingCDCConsumer.consumeCDC()
  }
}
