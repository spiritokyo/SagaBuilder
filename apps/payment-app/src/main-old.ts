import { RabbitMQClient } from './infra/rabbit/client'

void RabbitMQClient.initialize().then(() => {
  console.log('Server RabbitMQ was initialized (payment)...')
})
