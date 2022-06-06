import { Request, Response } from 'express';
import { ObsMapService } from './obsMap-services';
import { ObsMap } from './types';

export class ObsMapController {
  constructor(
    private obsService: ObsMapService,
    ){}
  
    create = async (req: Request, res: Response) => {
      const obsMap: ObsMap = req.body.obsMap;
      if (obsMap.count < 0){
        res.status(404).json({msg: 'no obstacles are added'})
      }
      const addedObsMap = await this.obsService.createObsMap(obsMap);
      res.json({id: addedObsMap})
    }
}