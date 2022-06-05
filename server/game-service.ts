import { Client } from 'pg';
import { knex } from './knex';
import { StarMap } from './type';

export class GameService {
  constructor(private client: Client) {}

  async create(starMap: StarMap): Promise<number> {
    const count = starMap.count;
    const coordinates = starMap.coordinates;
    const row = await knex
      .insert({
        count,
        coordinates,
      })
      .into('star_map')
      .returning('id');
    return row[0].id;
  }
}
