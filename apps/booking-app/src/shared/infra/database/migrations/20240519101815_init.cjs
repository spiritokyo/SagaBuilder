/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  await knex.schema.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"')
    .createTable('Saga', (table) => {
      table.uuid('id', { primaryKey: true }).defaultTo(knex.raw("uuid_generate_v4()"))
      table.string('name').notNullable()
      table.uuid('child_aggregate_id').nullable()
      table.jsonb('state').notNullable()
      /**
       * is_error_saga: boolean
       * completed_step: TSagaStateUnion
       * is_compensating_direction: boolean
       * is_completed: boolean
       * is_child_aggregate_persisted: boolean
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
