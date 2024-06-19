// import { argv } from 'process'

// const isOutsideDocker = argv.at(-1) === '--outside-docker'

export const rabbitMQConfig = {
  rabbitMQ: {
    credentials: {
      hostname: 'rabbitmq',
      port: 5672,
      username: 'user',
      password: 'password',
    },
    rpcQueueName: 'q.rpc',
  },
}
