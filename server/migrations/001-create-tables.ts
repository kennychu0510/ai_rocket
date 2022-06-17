import { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  if (!(await knex.schema.hasTable('map'))) {
    await knex.schema.createTable('map', table => {
      table.increments('id')
      table.text('stars').notNullable()
      table.text('meteorites').notNullable()
      table.text('black_holes').notNullable()
      table.text('black_hole_map').notNullable()
      table.string('name', 30).notNullable()
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

  if (!(await knex.schema.hasTable('ai_rocket'))) {
    await knex.schema.createTable('ai_rocket', table => {
      table.increments('id')
      table.string('name', 255).notNullable()
      table.string('type', 30).notNullable()
      table.integer('map_id').unsigned().notNullable().references('map.id')
      table.integer('fitness').notNullable()
      table.text('genes').notNullable()
      table.integer('stars').notNullable()
      table.integer('total_moves').notNullable()
      table.text('bias').nullable()
      table.timestamps(false, true)
    })
  }
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('ai_rocket')
  await knex.schema.dropTableIfExists('scores')
  await knex.schema.dropTableIfExists('map')
}
