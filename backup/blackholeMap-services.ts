import { Knex as KnexType } from 'knex';
import { BlackHole } from './types';

//123
export class BlackHoleService {
  constructor (private knex: KnexType){}

  async createBlackHole (blackhole: BlackHole): Promise<number>{
    const count = blackhole.count;
    const coordinates = blackhole.coordinates;
    console.log(count, coordinates);
    const row = await this.knex
      .insert({
        count: count,
        coordinates: coordinates,
      })
      .into ('black_hole_location')
      .returning ('id')
    return row[0].id
  }
}
