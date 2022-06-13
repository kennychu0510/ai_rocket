import { Knex as KnexType } from 'knex';

export type RocketAIRecord = {
  name: string;
  mapID: number;
  fitness: number;
  starsCollected: number;
  moves: string;
  totalMoves: number;
};
export class RocketAIServices {
  constructor(private knex: KnexType) {}
  async saveRocketAI(rocketAI: RocketAIRecord) {
    const name = rocketAI.name;
    const mapID = rocketAI.mapID;
    const fitness = rocketAI.fitness;
    const starsCollected = rocketAI.starsCollected;
    const moves = rocketAI.moves;
    const totalMoves = rocketAI.totalMoves;
    const row = await this.knex
      .insert({
        name,
        map_id: mapID,
        fitness,
        moves,
        stars: starsCollected,
        total_moves: totalMoves,
      })
      .into('ai_rocket')
      .returning('id');
    return row[0].id;
  }
  async getAllRocket(mapID: number): Promise<RocketAIRecord[]> {
    const results = await this.knex
      .select('id', 'name', 'map_id', 'fitness', 'stars', 'total_moves')
      .from('ai_rocket')
      .where('map_id', mapID);
    return results;
  }
  async getRocket(id: number): Promise<number[]> {
    const results = await this.knex
      .select('moves')
      .from('ai_rocket')
      .where('id', id);
    return results[0].moves.split('').map(Number);
  }
}
