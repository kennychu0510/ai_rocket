import { Knex as KnexType } from 'knex';
import { StarMap } from './types';

export class StarMapService {
  constructor(private knex: KnexType) {}

  async createStarMap(starMap: StarMap): Promise<number> {
    const count = starMap.count;
    const coordinates = starMap.coordinates;
    console.log(count, coordinates);
    const row = await this.knex
      .insert({
        count: count,
        coordinates: JSON.stringify(coordinates),
      })
      .into('star_location')
      .returning('id');
    return row[0].id;
  }

  async getStarMaps(): Promise<StarMap[]> {
    const results = await this.knex
      .select('id', 'count', 'coordinates')
      .from('star_location')
      .where('count', '2');
    results.forEach((row) => {
      console.log(row);
      row.coordinates = JSON.parse(row.coordinates);
    });
    return results;
  }
}
