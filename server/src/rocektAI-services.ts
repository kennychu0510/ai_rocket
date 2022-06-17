import { Knex as KnexType } from 'knex';

export type RocketAIRecord = {
  name: string;
  mapID: number;
  fitness: number;
  starsCollected: number;
  genes: string;
  totalMoves: number;
  type: string;
  bias: string;
};
export class RocketAIServices {
  constructor(private knex: KnexType) {}
  async saveRocketAI(rocketAI: RocketAIRecord) {
    const name = rocketAI.name;
    const mapID = rocketAI.mapID;
    const fitness = rocketAI.fitness;
    const starsCollected = rocketAI.starsCollected;
    const genes = rocketAI.genes;
    const totalMoves = rocketAI.totalMoves;
    const type = rocketAI.type;
    const bias = rocketAI.bias;
    const row = await this.knex
      .insert({
        name,
        map_id: mapID,
        fitness,
        genes,
        stars: starsCollected,
        total_moves: totalMoves,
        type,
        bias,
      })
      .into('ai_rocket')
      .returning('id');
    return row[0].id;
  }
  async getAllRocket(mapID: number, aiMode: string): Promise<RocketAIRecord[]> {
    const results = await this.knex
      .select('id', 'name', 'map_id', 'fitness', 'stars', 'total_moves', 'type')
      .from('ai_rocket');
    // .where('map_id', mapID)
    // .andWhere('type', aiMode);
    return results;
  }
  async getRocket(id: number): Promise<number[]> {
    const results = await this.knex
      .select('genes', 'bias', 'type')
      .from('ai_rocket')
      .where('id', id);
    return results[0];
  }
}
