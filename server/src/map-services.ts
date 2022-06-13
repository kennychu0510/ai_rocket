import { Knex as KnexType } from 'knex';
import { Map } from './types';

export type Location = { x: number; y: number };
export type NewMap = {
  stars: Location[];
  meteorites: Location[];
  blackholes: Location[];
  blackholeMap: number[];
  name: string;
};
export class MapService {
  constructor(private knex: KnexType) {}
  async createMap(map: NewMap) {
    const stars = map.stars;
    const meteorites = map.meteorites;
    const blackholes = map.blackholes;
    const blackholeMap = map.blackholeMap;
    const name = map.name;
    const row = await this.knex
      .insert({
        stars: JSON.stringify(stars),
        meteorites: JSON.stringify(meteorites),
        black_holes: JSON.stringify(blackholes),
        black_hole_map: JSON.stringify(blackholeMap),
        name: JSON.stringify(name)
      })
      .into('map')
      .returning('id');
    return row[0].id;
  }

  async getEasyMaps(): Promise<Map[]> {
    const results = await this.knex
      .select('id', 'stars', 'meteorites', 'black_holes', 'black_hole_map')
      .from('map')
      .where('id', 1);
    results.forEach((row) => {
      // console.log(row);
      row.stars = JSON.parse(row.stars);
      row.meteorites = JSON.parse(row.meteorites);
      row.black_holes = JSON.parse(row.black_holes);
      row.black_hole_map = JSON.parse(row.black_hole_map);
    });
    return results;
  }

  async getNormalMaps(): Promise<Map[]> {
    const results = await this.knex
      .select('id', 'stars', 'meteorites', 'black_holes', 'black_hole_map')
      .from('map')
      .where('id', 2);
    results.forEach((row) => {
      // console.log(row);
      row.stars = JSON.parse(row.stars);
      row.meteorites = JSON.parse(row.meteorites);
      row.black_holes = JSON.parse(row.black_holes);
      row.black_hole_map = JSON.parse(row.black_hole_map);
    });
    return results;
  }

  async getHardMaps(): Promise<Map[]> {
    const results = await this.knex
      .select('id', 'stars', 'meteorites', 'black_holes', 'black_hole_map')
      .from('map')
      .where('id', 3);
    results.forEach((row) => {
      // console.log(row);
      row.stars = JSON.parse(row.stars);
      row.meteorites = JSON.parse(row.meteorites);
      row.black_holes = JSON.parse(row.black_holes);
      row.black_hole_map = JSON.parse(row.black_hole_map);
    });
    return results;
  }
}
