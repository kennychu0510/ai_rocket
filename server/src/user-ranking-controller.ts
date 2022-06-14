import { Request, Response } from 'express';
import { UserRankingService } from './user-ranking-service'


export class UserRankingController {
    constructor(private userRankingService: UserRankingService) { }

    get = async (req: Request, res: Response) => {
        const getAddedResult = await this.userRankingService.getUserRanks();
        console.log(getAddedResult);
        res.json({ getAddedResult })
    }
}
