exports.seed = async function(knex) {
  await knex('Booking').del();
  
  await knex('Booking').insert([
    {
      customer_id: 1,
      course_id: 1,
      email: 'example1@example.com',
    },
    {
      customer_id: 2,
      course_id: 2,
      email: 'example2@example.com',
    }
  ]);
};
