import { Knex as KnexType } from 'knex';
import { meteorite } from './types';

export class  MeteoriteService {
  constructor (private knex: KnexType){}

  async createMeteorite (meteorite: meteorite): Promise<number>{
    const count = meteorite.count;
    const coordinates = meteorite.coordinates;
    console.log(count, coordinates);
    const row = await this.knex
      .insert({
        count: count,
        coordinates: coordinates,
      })
      .into ('meteorite_location')
      .returning ('id')
    return row[0].id
  }
}
