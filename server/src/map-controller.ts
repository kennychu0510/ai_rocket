import { Request, Response } from 'express';
import { MapService } from './map-services';
// import { Map } from './types';

export class MapController {
  constructor(private mapService: MapService) {}
  get = async (req: Request, res: Response) => {
    const level = req.query.diff;
    if (level === 'easy') {
      res.json(await this.mapService.getEasyMaps());
    }
    if (level === 'normal') {
      res.json(await this.mapService.getNormalMaps());
    }
    if (level === 'hard') {
      res.json(await this.mapService.getHardMaps());
    }
  };

  create = async (req: Request, res: Response) => {
    const stars = req.body.stars;
    const meteorites = req.body.meteorites;
    const blackholes = req.body.blackholes;
    if (stars.length <= 0 && meteorites.length <= 0 && blackholes.length <= 0) {
      res.status(404).json({ msg: 'nothing is added' });
      return;
    }
    const addedMap = await this.mapService.createMap({
      stars,
      meteorites,
      blackholes: blackholes,
    });
    res.json({ id: addedMap });
  };
}
