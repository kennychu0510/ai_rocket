import { Request, Response } from 'express';
import { StarMapService } from './starMap-services';
import { StarMap } from './types';

export class StarMapController {
  constructor(private starService: StarMapService) {}

  get = async (req: Request, res: Response) => {
    res.json(await this.starService.getStarMaps());
  };

  create = async (req: Request, res: Response) => {
    const starMap: StarMap = req.body.starMap;
    if (starMap.count < 0) {
      res.status(400).json({ msg: 'no stars are added' });
      return;
    }
    const addedStarMap = await this.starService.createStarMap(starMap);
    res.json({ id: addedStarMap });
  };

  test = async (req: Request, res: Response) => {
    const received = req.body;
    console.log(received);
    res.json({ msg: received });
  };
}
