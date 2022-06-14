import { Request, Response } from 'express';
import { RocketAIServices } from './rocektAI-services';

export class RocketAIController {
  constructor(private rocketAIServices: RocketAIServices) {}
  create = async (req: Request, res: Response) => {
    const name = String(req.body.name);
    const mapID = Number(req.body.mapID);
    const starsCollected = Number(req.body.starsCollected);
    const fitness = Number(req.body.fitness);
    const genes = String(req.body.genes);
    const totalMoves = Number(req.body.totalMoves);
    const type = req.body.type;
    const bias = req.body.bias;
    const addedResult = await this.rocketAIServices.saveRocketAI({
      name,
      mapID,
      fitness,
      starsCollected,
      genes,
      totalMoves,
      type,
      bias,
    });
    res.json({ id: addedResult });
  };
  getAll = async (req: Request, res: Response) => {
    const mapID = Number(req.params.mapID);
    const aiMode = req.params.aiMode;
    res.json(await this.rocketAIServices.getAllRocket(mapID, aiMode));
  };
  get = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    res.json(await this.rocketAIServices.getRocket(id));
  };
}
