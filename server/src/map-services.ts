import { Knex as KnexType } from 'knex';
import { Map } from './types';

export type Location = { x: number; y: number };
export type NewMap = {
  stars: Location[];
  meteorites: Location[];
  blackholes: Location[];
};
export class MapService {
  constructor(private knex: KnexType) {}
  async createMap(map: NewMap) {
    const stars = map.stars;
    const meteorites = map.meteorites;
    const blackholes = map.blackholes;
    const row = await this.knex
      .insert({
        stars: JSON.stringify(stars),
        meteorites: JSON.stringify(meteorites),
        blackholes: JSON.stringify(blackholes),
        levels: 1,
      })
      .into('map')
      .returning('id');
    return row[0].id;
  }

  async getEasyMaps(): Promise<Map[]> {
    const results = await this.knex
      .select('id', 'stars', 'meteorites', 'black_holes')
      .from('map')
      .where('levels', 1);
    results.forEach((row) => {
      console.log(row);
      row.stars = JSON.parse(row.stars);
      row.meteorites = JSON.parse(row.meteorites);
      row.blackholes = JSON.parse(row.blackholes);
    });
    return results;
  }
}
