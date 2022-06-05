import { Request, Response } from 'express';
import { GameService } from './game-service';

export class GameController {
  constructor(
    private gameService: GameService,
  ) {}

  create = (req: Request, res: Response) => {
    const { count, coordinates } = req.body;
    res.json({ status: 'added star map' });
  };
}
