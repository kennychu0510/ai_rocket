import { Request, Response } from 'express';
import { RocketAIServices } from './rocektAI-services';

export class RocketAIController {
  constructor(private rocketAIServices: RocketAIServices) {}
  create = async (req: Request, res: Response) => {
    const name = String(req.body.name);
    const mapID = Number(req.body.mapID);
    const starsCollected = Number(req.body.starsCollected);
    const fitness = Number(req.body.fitness);
    const moves = String(req.body.moves);
    const totalMoves = Number(req.body.totalMoves);
    const addedResult = await this.rocketAIServices.saveRocketAI({
      name,
      mapID,
      fitness,
      starsCollected,
      moves,
      totalMoves,
    });
    res.json({ id: addedResult });
  };
  get = async (req: Request, res: Response) => {
    res.json(await this.rocketAIServices.getRocket());
  };
}