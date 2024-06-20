const { dbConfig } = require("./config.js")

const config = {
  client: 'postgresql',
  connection: {
    host: dbConfig.host,
    port: dbConfig.port,
    user: dbConfig.user,
    password: dbConfig.password,
    database: dbConfig.database,
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
