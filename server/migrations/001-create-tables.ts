import { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  if (!(await knex.schema.hasTable('star_location'))) {
    await knex.schema.createTable('star_location', table => {
      table.increments('id')
      table.integer('count').notNullable()
      table.text('coordinates').notNullable()
      table.timestamps(false, true)
    })
  }

  if (!(await knex.schema.hasTable('meteorite_location'))) {
    await knex.schema.createTable('meteorite_location', table => {
      table.increments('id')
      table.integer('count').notNullable()
      table.text('coordinates').notNullable()
      table.timestamps(false, true)
    })
  }

  if (!(await knex.schema.hasTable('black_hole_location'))) {
    await knex.schema.createTable('black_hole_location', table => {
      table.increments('id')
      table.integer('count').notNullable()
      table.text('coordinates').notNullable()
      table.timestamps(false, true)
    })
  }

  if (!(await knex.schema.hasTable('scores'))) {
    await knex.schema.createTable('scores', table => {
      table.increments('id')
      table.string('user').notNullable()
      table.integer('star_location_id').unsigned().notNullable().references('star_location.id')
      table.integer('meteorite_location_id').unsigned().notNullable().references('meteorite_location.id')
      table.integer('black_hole_location_id').unsigned().notNullable().references('black_hole_location.id')
      table.time('time').notNullable()
      table.timestamps(false, true)
    })
  }
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('scores')
  await knex.schema.dropTableIfExists('black_hole_location')
  await knex.schema.dropTableIfExists('meteorite_location')
  await knex.schema.dropTableIfExists('star_location')
}
