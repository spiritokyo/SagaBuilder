import { Injectable } from '@nestjs/common';

@Injectable()
export class MessageBrokerAppService {
  getHello(): string {
    return 'Hello World!';
  }
}
