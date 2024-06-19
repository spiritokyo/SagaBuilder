import { Controller, Get } from '@nestjs/common';
import { MessageBrokerAppService } from './message-broker-app.service';

@Controller()
export class MessageBrokerAppController {
  constructor(private readonly messageBrokerAppService: MessageBrokerAppService) {}

  @Get()
  getHello(): string {
    return this.messageBrokerAppService.getHello();
  }
}
