import type { DynamicModule, Provider } from '@nestjs/common'
import { Global, Module } from '@nestjs/common'

import { RabbitMQClient } from './client'

@Global()
@Module({})
export class RabbitMQModule {
  static RABBITMQ_BOOKING_TOKEN = 'RABBITMQ_BOOKING_TOKEN'

  static register(): DynamicModule {
    const connectionProvider: Provider = {
      provide: RabbitMQModule.RABBITMQ_BOOKING_TOKEN,
      useFactory: async (): Promise<RabbitMQClient> => await RabbitMQClient.initialize(),
    }

    return {
      module: RabbitMQModule,
      providers: [connectionProvider],
      exports: [connectionProvider],
    }
  }
}
