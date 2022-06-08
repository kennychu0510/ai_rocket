
import { Knex as KnexType } from 'knex';

export type user ={
    user:string;
    timeTaken:string;
    level:number;
}
export class UserService{
    constructor(private knex: KnexType) {}
    async createResult(scores:user){
        const user = scores.user;
        const timeTaken = scores.timeTaken;
        const level = scores.level;
        const row = await this.knex

        .insert({
            user,
            time:timeTaken,
            map_id:level,
        })
        .into('scores')
        .returning('id')
        return row[0].id
    }
}



