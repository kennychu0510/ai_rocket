import { Knex as KnexType } from 'knex';
import { StarMap } from './types';

export class StarMapService {
  constructor(private knex: KnexType) {}

  async createStarMap(starMap: StarMap): Promise<number> {
    const count = starMap.count;
    const coordinates = starMap.coordinates;
    const row = await this.knex
      .insert({
        count: count,
        coordinates: coordinates,
      })
      .into('star_map')
      .returning('id');
    return row[0].id;
  }

  async getStarMaps(): Promise<StarMap[]> {
    const results = await this.knex
      .select('id', 'count', 'coordinates')
      .from('star_map');
    return results;
  }
}
