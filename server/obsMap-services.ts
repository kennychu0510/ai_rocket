import { Knex as KnexType } from 'knex';
import { ObsMap } from './types';

//123
export class ObsMapService {
  constructor (private knex: KnexType){}

  async createObsMap (obsMap: ObsMap): Promise<number>{
    const count = obsMap.count;
    const coordinates = obsMap.coordinates;
    console.log(count, coordinates);
    const row = await this.knex
      .insert({
        count: count,
        coordinates: coordinates,
      })
      .into ('obs_map')
      .returning ('id')
    return row[0].id
  }
}
