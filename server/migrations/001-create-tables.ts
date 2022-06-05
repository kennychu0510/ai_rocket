import { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  if (!(await knex.schema.hasTable('map'))) {
    await knex.schema.createTable('map', table => {
      table.increments('id')
      table.string('obstacles').notNullable()
      table.timestamps(false, true)
    })
  }

  if (!(await knex.schema.hasTable('stars'))) {
    await knex.schema.createTable('stars', table => {
      table.increments('id')
      table.integer('count').notNullable()
      table.point('coordinates').notNullable()
      table.timestamps(false, true)
    })
  }

  if (!(await knex.schema.hasTable('highscore'))) {
    await knex.schema.createTable('highscore', table => {
      table.increments('id')
      table.string('user').notNullable()
      table.integer('map').unsigned().notNullable().references('map.id')
      table.integer('stars').unsigned().notNullable().references('stars.id')
      table.time('time').notNullable()
      table.timestamps(false, true)
    })
  }
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('highscore')
  await knex.schema.dropTableIfExists('stars')
  await knex.schema.dropTableIfExists('map')
}
