import { Knex as KnexType } from 'knex';
import { UserRanking } from './types';



export class UserRankingService {
    constructor(private knex: KnexType) { }
    async getUserRanks(level:number, page:number): Promise<UserRanking[]> {
        // page 1 offset = 0 page 2 offset = 10 
        let numberPerPage = getNumberPerPage(page);
        const results = await this.knex

            .select()
            .limit(10)
            .offset(numberPerPage)
            .from('scores')
            .orderBy('time')
            .where('map_id', "=" ,level)

        return results;

    }

}

function getNumberPerPage(page:number): number {
    if (page == 1) return 0
    return (page - 1) * 10
}



