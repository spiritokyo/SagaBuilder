import { Injectable } from '@nestjs/common';

@Injectable()
export class PaymentAppService {
  getHello(): string {
    return 'Hello World!';
  }
}
