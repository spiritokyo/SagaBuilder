import { Test, TestingModule } from '@nestjs/testing';
import { MessageBrokerAppController } from './message-broker-app.controller';
import { MessageBrokerAppService } from './message-broker-app.service';

describe('MessageBrokerAppController', () => {
  let messageBrokerAppController: MessageBrokerAppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [MessageBrokerAppController],
      providers: [MessageBrokerAppService],
    }).compile();

    messageBrokerAppController = app.get<MessageBrokerAppController>(MessageBrokerAppController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(messageBrokerAppController.getHello()).toBe('Hello World!');
    });
  });
});
