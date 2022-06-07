import { Knex } from "knex";


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
  await knex.schema.alterTable('scores', table => {
    table.integer('map_id').unsigned().notNullable().references('map.id')
    table.dropColumn('star_location_id')
    table.dropColumn('meteorite_location_id')
    table.dropColumn('black_hole_location_id')
  })
  await knex.schema.dropTableIfExists('black_hole_location')
  await knex.schema.dropTableIfExists('meteorite_location')
  await knex.schema.dropTableIfExists('star_location')
}


export async function down(knex: Knex): Promise<void> {
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
  await knex.schema.alterTable('scores', table => {
    table.dropColumn('map_id')
    table.integer('star_location_id').unsigned().references('star_location.id')
      table.integer('meteorite_location_id').unsigned().references('meteorite_location.id')
      table.integer('black_hole_location_id').unsigned().references('black_hole_location.id')
  })
  await knex.schema.dropTableIfExists('map')
}
