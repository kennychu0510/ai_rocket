import { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  if (!(await knex.schema.hasTable('map'))) {
    await knex.schema.createTable('map', table => {
      table.increments('id')
      table.text('stars').notNullable()
      table.text('meteorites').notNullable()
      table.text('black_holes').notNullable()
      table.integer('levels').notNullable()
      table.timestamps(false, true)
    })
  }

  if (!(await knex.schema.hasTable('scores'))) {
    await knex.schema.createTable('scores', table => {
      table.increments('id')
      table.string('user', 30).notNullable()
      table.string('time', 255).notNullable()
      table.integer('map_id').unsigned().notNullable().references('map.id')
      table.timestamps(false, true)
    })
  }
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('scores')
  await knex.schema.dropTableIfExists('map')
}
