import { Knex as KnexType } from 'knex';
import { UserRanking } from './types';



export class UserRankingService {
    constructor(private knex: KnexType) { }
    async getUserRanks(): Promise<UserRanking[]> {
        const results = await this.knex

            .select()
            .limit(10)
            .from('scores')
            .orderBy('time')


        return results;

    }

}



