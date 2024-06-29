import { PaymentService } from '@payment-application/payment.service'
import { connect } from 'amqplib'
import type { Channel, Connection } from 'amqplib'

import { rabbitMQConfig } from '@libs/common/shared'

import { CommandMessagePublisherRabbitMQ } from './command-message.publisher'
import { PaymentConsumerRabbitMQ } from './payment.consumer'

export class RabbitMQClient {
  public static instance: null | RabbitMQClient = null

  private constructor(
    public clientProducer: CommandMessagePublisherRabbitMQ,
    public clientConsumer: PaymentConsumerRabbitMQ,
    public channelPayment: Channel,
    public channelBookingSagaReplyTo: Channel,
    public connection: Connection,
  ) {}

  static async initialize(): Promise<RabbitMQClient> {
    try {
      if (RabbitMQClient.instance) {
        return RabbitMQClient.instance
      }

      const connection = await connect(rabbitMQConfig.rabbitMQ.credentials)

      // Input channel
      const channelPayment = await connection.createChannel()
      // Output channel
      const channelBookingSagaReplyTo = await connection.createChannel()

      const clientProducer = new CommandMessagePublisherRabbitMQ(channelBookingSagaReplyTo)
      const clientConsumer = new PaymentConsumerRabbitMQ(
        PaymentService,
        channelPayment,
        clientProducer,
      )

      RabbitMQClient.instance = new RabbitMQClient(
        clientProducer,
        clientConsumer,
        channelPayment,
        channelBookingSagaReplyTo,
        connection,
      )

      /**
       * Register consumer handlers
       */
      await RabbitMQClient.instance.consumePaymentForBooking()

      console.log('[RabbitMQClient]: initialized')

      return RabbitMQClient.instance
    } catch (err) {
      console.error('[RabbitMQ]', 'error', err)
      throw err
    }
  }

  async consumePaymentForBooking(): Promise<void> {
    return await this.clientConsumer.consumePaymentForBooking()
  }
}
