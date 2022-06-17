import { log } from 'console';
import { Request, Response } from 'express';
import { UserRankingService } from './user-ranking-service';

export class UserRankingController {
  constructor(private userRankingService: UserRankingService) {}
  get = async (req: Request, res: Response) => {
    const level = +req.query.level;
    const page = +req.query.page;

    const data = await this.userRankingService.getUserRanks(level, page);
    console.log(data);
    res.json({ data });
  };
}
