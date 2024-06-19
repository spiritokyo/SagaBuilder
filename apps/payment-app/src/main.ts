import { NestFactory } from '@nestjs/core';
import { PaymentAppModule } from './payment-app.module';

async function bootstrap() {
  const app = await NestFactory.create(PaymentAppModule);
  await app.listen(3000);
}
bootstrap();
