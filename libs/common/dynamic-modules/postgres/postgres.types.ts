import type { Client } from 'pg'

export type PostgresModuleOptions = {
  name?: string
  clientOptions?: Client
  host?: string
  database?: string
  password?: string
  user?: string
  port?: number
  ssl?: boolean | PostgresSSLOptions
  connectionString?: string
  retryAttempts?: number
  retryDelay?: number
  waitForConnections?: boolean
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  types?: any
  statementTimeout?: number
  queryTimeout?: number
  applicationName?: string
  connectionTimeoutMillis?: number
  idleInTransactionSessionTimeout?: number
}

type PostgresSSLOptions = {
  rejectUnauthorized?: boolean
  ca?: string
  key?: string
  cert?: string
}
