import type { DynamicModule, OnApplicationShutdown, OnModuleInit, Provider } from '@nestjs/common'
import { Global, Inject, Module } from '@nestjs/common'
import { Pool } from 'pg'
import type { PoolClient } from 'pg'

import { PG_POOL, PG_OPTIONS } from './postgres.constants'
import { createPoolFactory, getConnectionToken, createConnectionFactory } from './postgres.helpers'
import type { PostgresModuleOptions } from './postgres.types'

@Global()
@Module({})
export class PostgresModule implements OnModuleInit, OnApplicationShutdown {
  constructor(@Inject(PG_POOL) private readonly pool: Pool) {}

  static forRoot(options: PostgresModuleOptions): DynamicModule {
    const pgOptionsProvider: Provider = {
      provide: PG_OPTIONS,
      useValue: options,
    }

    const poolProvider: Provider = {
      provide: PG_POOL,
      useFactory: (): Pool => createPoolFactory(options),
    }

    const connectionProvider: Provider = {
      inject: [PG_POOL],
      provide: getConnectionToken(options.name),
      useFactory: async (pool: Pool): Promise<PoolClient> => await createConnectionFactory(pool),
    }

    return {
      module: PostgresModule,
      providers: [pgOptionsProvider, poolProvider, connectionProvider],
      exports: [connectionProvider],
    }
  }

  onModuleInit(): void {
    this.pool.on('error', (err) => {
      console.error('Unexpected error on idle client', err)
      process.exit(-1)
    })

    this.pool.on('connect', () => {
      console.log('[PostgresPool]: initialize new connection')

      // client.query('SET SESSION CHARACTERISTICS AS TRANSACTION ISOLATION LEVEL SERIALIZABLE')
    })
  }

  async onApplicationShutdown(): Promise<void> {
    await this.pool.end()
  }
}
