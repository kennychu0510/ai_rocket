import { Request, Response } from 'express';
import { MapService } from './map-services';
import { Map } from './types';

export class MapController {
  constructor(private mapService: MapService) {}
  get = async (req: Request, res: Response) => {
    res.json(await this.mapService.getEasyMaps());
  };
  create = async (req: Request, res: Response) => {
    const stars = req.body.stars;
    if (stars.length <= 0) {
      res.status(400).json({ msg: 'no stars are added' });
      return;
    }
    const meteorites = req.body.meteorites;
    if (meteorites.length <= 0) {
      res.status(404).json({ msg: 'no meteorite are added' });
    }
    const blackholes = req.body.blackholes;
    if (blackholes.length <= 0) {
      res.status(404).json({ msg: 'no blackhole are added' });
    }
    const addedMap = await this.mapService.createMap({
      stars,
      meteorites,
      blackholes: blackholes,
    });
    res.json({ id: addedMap });
  };
}
