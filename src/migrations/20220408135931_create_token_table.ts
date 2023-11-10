import Knex from 'knex';
/**
 * Create table `table_name`.
 *
 * @param   {object} knex
 * @returns {Promise}
 */

const TABLE_NAME = 'tokens';
export function up(knex: Knex) {
  return knex.schema.createTable(TABLE_NAME, (table) => {
    table.increments();
    table.timestamp('created_at').notNullable().defaultTo(knex.raw('now()'));
    table.timestamp('updated_at').notNullable().defaultTo(knex.raw('now()'));
    table.string('value').notNullable();
    table.integer('user_id').references('users.id').notNullable().unique().onDelete('CASCADE');
  });
}

/**
 * Drop `table_name`.
 *
 * @param   {object} knex
 * @returns {Promise}
 */
export function down(knex: Knex) {
  return knex.schema.dropTable(TABLE_NAME);
}
