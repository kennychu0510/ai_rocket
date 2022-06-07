import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('scores', table => {
    table.string('user', 30).notNullable().alter()
    table.integer('duration').notNullable()
  })
}


export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('scores', table => {
    table.dropColumn('duration')
    table.string('user', 255).notNullable().alter()
  })
}
