import { Knex as KnexType } from 'knex';

export type user = {
  user: string;
  timeTaken: string;
  id: number;
};
export class UserService {
  constructor(private knex: KnexType) { }
  async createResult(scores: user) {
    const user = scores.user;
    const timeTaken = scores.timeTaken;
    const id = scores.id;
    const row = await this.knex

      .insert({
        user,
        time: timeTaken,
        map_id: id,
      })
      .into('scores')
      .returning('id');
    return row[0].id;
  }
}
