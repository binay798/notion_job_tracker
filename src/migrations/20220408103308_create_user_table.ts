import Knex from 'knex';

const TABLE_NAME = 'users';
export function up(knex: Knex): Promise<void> {
  return knex.schema.createTable(TABLE_NAME, (table) => {
    table.increments();
    table.timestamp('created_at').notNullable().defaultTo(knex.raw('now()'));
    table.timestamp('updated_at').notNullable().defaultTo(knex.raw('now()'));
    table.string('firstname').notNullable();
    table.string('lastname').notNullable();
    table.string('email').notNullable();
    table.string('password').notNullable();
    table.boolean('verified').notNullable().defaultTo(false);
    table.string('image');
  });
}

export function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable(TABLE_NAME);
}
