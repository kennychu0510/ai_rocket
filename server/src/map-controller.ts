import { Request, Response } from 'express';
import { MapService } from './map-services';
// import { Map } from './types';

export class MapController {
  constructor(private mapService: MapService) {}
  get = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    if (id === 1) {
      res.json(await this.mapService.getEasyMaps());
    }
    if (id === 2) {
      res.json(await this.mapService.getNormalMaps());
    }
    if (id === 3) {
      res.json(await this.mapService.getHardMaps());
    }
    if (id > 3) {
      res.json(await this.mapService.getCustomMaps());
    }
  };

  create = async (req: Request, res: Response) => {
    const stars = req.body.stars;
    const meteorites = req.body.meteorites;
    const blackholes = req.body.blackholes;
    const blackholeMap = req.body.blackholeMap;
    const name = req.body.name;
    if (stars.length <= 0 && meteorites.length <= 0 && blackholes.length <= 0) {
      res.status(404).json({ msg: 'nothing is added' });
      return;
    }
    const addedMap = await this.mapService.createMap({
      stars,
      meteorites,
      blackholes,
      blackholeMap,
      name,
    });
    res.json({ msg: `added map-${addedMap}` });
  };
}
