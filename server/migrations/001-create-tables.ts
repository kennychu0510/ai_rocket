import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  if (!(await knex.schema.hasTable('star_map'))) {
    await knex.schema.createTable('star_map', (table) => {
      table.increments('id');
      table.integer('count').notNullable();
      table.text('coordinates').notNullable();
      table.timestamps(false, true);
    });
  }

  if (!(await knex.schema.hasTable('scores'))) {
    await knex.schema.createTable('scores', (table) => {
      table.increments('id');
      table.string('user').notNullable();
      table
        .integer('star_map_id')
        .unsigned()
        .notNullable()
        .references('star_map.id');
      table.time('time').notNullable();
      table.timestamps(false, true);
    });
  }
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('scores');
  await knex.schema.dropTableIfExists('star_map');
}
