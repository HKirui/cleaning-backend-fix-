exports.up = function (knex) {
  return knex.schema.createTable('users', table => {
    table.increments('id').primary();
    table.string('first_name');
    table.string('last_name');
    table.string('email').notNullable().unique();
    table.string('phone').unique();
    table.string('password').notNullable();
    table.string('user_type').defaultTo('user');
    table.boolean('subscribed').defaultTo(false);
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('users');
};
