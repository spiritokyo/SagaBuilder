import { Module } from '@nestjs/common';
import { MessageBrokerAppController } from './message-broker-app.controller';
import { MessageBrokerAppService } from './message-broker-app.service';

@Module({
  imports: [],
  controllers: [MessageBrokerAppController],
  providers: [MessageBrokerAppService],
})
export class MessageBrokerAppModule {}
