import { Module } from '@nestjs/common'

import { PostgresModule } from '@libs/common/dynamic-modules/postgres'

import { ReserveBookingSagaModule } from './modules/reserve-booking-saga'
import { dbConfig } from './shared/infra/postgres/config'
import { RabbitMQModule } from './shared/infra/rabbit'

@Module({
  imports: [
    PostgresModule.forRoot(dbConfig),
    RabbitMQModule.register(),
    //
    ReserveBookingSagaModule,
  ],
})
export class AppModule {}
