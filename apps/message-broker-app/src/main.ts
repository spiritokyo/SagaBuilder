import { NestFactory } from '@nestjs/core';
import { MessageBrokerAppModule } from './message-broker-app.module';

async function bootstrap() {
  const app = await NestFactory.create(MessageBrokerAppModule);
  await app.listen(3000);
}
bootstrap();
