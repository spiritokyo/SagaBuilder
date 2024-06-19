const { dbConfig } = require("./config.cjs")

const config = {
  client: 'postgresql',
  connection: {
    host: dbConfig.POSTGRES_HOST,
    port: dbConfig.POSTGRES_PORT,
    user: dbConfig.POSTGRES_USER,
    password: dbConfig.POSTGRES_PASSWORD,
    database: dbConfig.POSTGRES_DB,
  },
  migrations: {
    tableName: 'knex_migrations',
    directory: './migrations',
    loadExtensions: ['.cjs'],
    extension: 'cjs',
  },
  seeds: {
    directory: './seeds'
  }
}

module.exports = config
