import { Module, Scope } from '@nestjs/common'

import { RabbitMQClient } from './client'

@Module({
  providers: [
    {
      provide: RabbitMQModule.RABBITMQ_BOOKING_TOKEN,
      useFactory: async (): Promise<RabbitMQClient> => await RabbitMQClient.initialize(),
      scope: Scope.DEFAULT,
    },
  ],
  exports: [RabbitMQModule.RABBITMQ_BOOKING_TOKEN],
})
export class RabbitMQModule {
  static RABBITMQ_BOOKING_TOKEN = 'RABBITMQ_BOOKING_TOKEN'
}
