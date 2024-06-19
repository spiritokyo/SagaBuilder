import type { PoolClient, PoolConfig } from 'pg'
import Pg from 'pg'

// @ts-expect-error ...
import { dbConfig } from './config.cjs'

const { Pool } = Pg

const pool = new Pool({
  user: dbConfig.POSTGRES_USER,
  password: dbConfig.POSTGRES_PASSWORD,
  host: dbConfig.POSTGRES_HOST,
  port: dbConfig.POSTGRES_PORT,
  database: dbConfig.POSTGRES_DB,
} satisfies PoolConfig)

let poolClient: PoolClient | null = null

// the pool will emit an error on behalf of any idle clients
// it contains if a backend error or network partition happens
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err)
  process.exit(-1)
})

pool.on('connect', () => {
  console.log('[PostgresPool]: initialize new connection')

  // client.query('SET SESSION CHARACTERISTICS AS TRANSACTION ISOLATION LEVEL SERIALIZABLE')
})

export const getConnection = async (): Promise<PoolClient> => {
  if (!poolClient) {
    // eslint-disable-next-line require-atomic-updates
    poolClient = await pool.connect()
  }

  return poolClient
}
