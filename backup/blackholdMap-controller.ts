import { Request, Response } from 'express';
import { BlackHoleService } from './blackholeMap-services';
import { BlackHole } from './types';

export class BlackHoleController {
  constructor(
    private blackHoleService: BlackHoleService,
    ){}
  
    create = async (req: Request, res: Response) => {
      const blackhole: BlackHole = req.body.BlackHole;
      if (blackhole.count < 0){
        res.status(404).json({msg: 'no obstacles are added'})
      }
      const addedObsMap = await this.blackHoleService.createBlackHole(blackhole);
      res.json({id: addedObsMap})
    }
}