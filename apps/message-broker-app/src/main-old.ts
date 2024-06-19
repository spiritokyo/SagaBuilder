import { connect } from 'amqplib'
import type { Channel, Connection, Replies } from 'amqplib'

import type { TChannelsUnion } from '@libs/common/shared'
import {
  rabbitMQConfig,
  CONTRACTS_QUEUES,
  bindings,
  CONTRACTS_EXCHANGES,
  CONTRACTS_ROUTING_KEYS,
} from '@libs/common/shared'

class RabbitMQServer {
  static connection: Connection

  static channels: Record<TChannelsUnion, Channel | null> = {
    channelBookingCDC: null,
    channelBookingSagaReplyTo: null,
    channelPayment: null,
  }

  static exchangeBooking: Replies.AssertExchange

  static async initialize(): Promise<void> {
    try {
      this.connection = await connect(rabbitMQConfig.rabbitMQ.credentials)

      for (const channel of Object.keys(this.channels) as TChannelsUnion[]) {
        this.channels[channel] = await this.connection.createChannel()
      }

      for (const binding of bindings) {
        await (this.channels[binding.channel] as Channel).assertQueue(binding.queue, {
          durable: false,
        })
      }

      /**
       * Set configuration for CDC
       */
      await (this.channels.channelBookingCDC as Channel).assertExchange(
        CONTRACTS_EXCHANGES.EX_BOOKING_CDC,
        'direct',
        {
          durable: false,
        },
      )

      await (this.channels.channelBookingCDC as Channel).bindQueue(
        CONTRACTS_QUEUES.Q_BOOKING_CDC,
        CONTRACTS_EXCHANGES.EX_BOOKING_CDC,
        CONTRACTS_ROUTING_KEYS.CMD_BOOKING_CDC,
      )
    } catch (err) {
      console.error('[RabbitMQ]', 'error', err)
    }
  }
}

async function initializeRabbitMQServer(): Promise<void> {
  try {
    await RabbitMQServer.initialize()

    await Promise.all(Object.values(RabbitMQServer.channels).map((ch) => (ch as Channel).close()))
    await RabbitMQServer.connection.close()

    console.log('End rabbitMQ migration')
  } catch (err) {
    console.error('[Error]', JSON.stringify(err, null, 2))
  }
}

void initializeRabbitMQServer()
