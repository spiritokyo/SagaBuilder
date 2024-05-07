/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  await knex.schema.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"')
    .createTable('ReserveBookingSaga', (table) => {
      table.uuid('id', { primaryKey: true }).defaultTo(knex.raw("uuid_generate_v4()"))
      table.jsonb('state').notNullable()
  })

  await knex.schema.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"').
    createTable('Booking', (table) => {
      table.uuid('id', { primaryKey: true }).defaultTo(knex.raw("uuid_generate_v4()"))
      table.integer('customer_id').notNullable()
      table.integer('course_id').notNullable()
      table.string('email').notNullable()
  })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
  await knex.schema.dropTableIfExists('ReserveBookingSaga')
  await knex.schema.dropTableIfExists('Booking')
};
