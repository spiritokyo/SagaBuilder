import { Inject } from '@nestjs/common'
import type { PoolClient } from 'pg'
import { Pool } from 'pg'

import type { PostgresModuleOptions } from './postgres.types'

/**
 * Helpers
 */
export const getConnectionToken = (connection?: string): string =>
  connection ? `TOKEN_${connection}` : 'TOKEN_DEFAULT_CONNECTION'
export const createPoolFactory = (options: PostgresModuleOptions): Pool => new Pool(options)
export const createConnectionFactory = (pool: Pool): Promise<PoolClient> => pool.connect()

/**
 * Decorators
 */
export const InjectConnection = (connection?: string): ParameterDecorator =>
  Inject(getConnectionToken(connection))
