/* eslint-disable new-cap */
/* eslint-disable @typescript-eslint/no-var-requires */
import Knex from 'knex';
const knexConfig = require('./knexfile');
const knex = Knex(knexConfig[process.env.NODE_ENV || 'development']);

async function main() {
  try {
    console.log('1. How many files per user');
    const ans1 = await knex
        .select('username')
        .count('* as file_count')
        .from('file')
        .innerJoin('user', 'user.id', 'file.owner_id')
        .groupBy('user.id');
    console.log(ans1);

    console.log('2. Files per category');
    const ans2 = await knex
        .select('category.name')
        .count('* as file_count')
        .from('file')
        .innerJoin('category', 'category.id', 'file.category_id')
        .groupBy('category.id');
    console.log(ans2);

    console.log('3. Important files from Alex');
    const ans3 = await knex
        .select('username', 'category.name')
        .count('* as file_count')
        .from('file')
        .innerJoin('user', 'user.id', 'file.owner_id')
        .innerJoin('category', 'category.id', 'file.category_id')
        .where('category.name', 'ilike', 'important')
        .where('username', 'ilike', 'alex')
        .groupBy('user.id', 'category.id');
    console.log(ans3);

    console.log('4. Users with over 800 files');
    const files = 420;
    const ans4 = await knex
        .select('username')
        .count('* as file_count')
        .from('file')
        .innerJoin('user', 'user.id', 'file.owner_id')
        .groupBy('user.id')
        .having(knex.raw('count(*) > ?', [files]));
    console.log(ans4);
  } catch (error) {
    console.log(error);
  }
  await knex.destroy();
}

main();
