import { Module } from '@nestjs/common'

import { RabbitMQModule } from './shared/infra/rabbit'

@Module({
  imports: [
    RabbitMQModule,
    //
    // PaymentModule,
  ],
})
export class AppModule {}
