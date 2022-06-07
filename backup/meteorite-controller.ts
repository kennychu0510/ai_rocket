import { Request, Response } from 'express';
import { MeteoriteService } from './meteorite-services';
import { meteorite } from './types';

export class MeteoriteController {
  constructor(
    private meteoriteService: MeteoriteService,
    ){}
  
    create = async (req: Request, res: Response) => {
      console.log(req.body);
      const meteorite: meteorite = req.body.meteorites;
      if (meteorite.count <= 0){
        res.status(404).json({msg: 'no meteorite are added'})
      }
      const addedMeteorite = await this.meteoriteService.createMeteorite(meteorite);
      res.json({id: addedMeteorite})
    }
}