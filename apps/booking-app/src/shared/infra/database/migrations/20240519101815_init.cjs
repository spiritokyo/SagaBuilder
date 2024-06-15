/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  await knex.schema.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"')
    .createTable('ReserveBookingSaga', (table) => {
      table.uuid('id', { primaryKey: true }).defaultTo(knex.raw("uuid_generate_v4()"))
      table.uuid('bookingId').nullable()
      table.jsonb('state').notNullable()
      /**
       * completed_step: TSagaStateUnion
       * is_compensating_direction: boolean
       * is_error_saga: boolean
       * is_completed: boolean
       */
    })

  await knex.schema.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"').
    createTable('Booking', (table) => {
      table.uuid('id', { primaryKey: true }).defaultTo(knex.raw("uuid_generate_v4()"))
      table.integer('customer_id').notNullable()
      table.integer('course_id').notNullable()
      table.integer('payment_id').nullable()
      table.enu('current_state', [
        'PAYMENT_PENDING', 'APPROVAL_PENDING', 'CANCEL_PENDING',
        'CONFIRMED', 'REJECTED', 'FROZEN'
      ])
      table.string('email').notNullable()
      table.boolean('is_frozen').defaultTo(false).notNullable()
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
