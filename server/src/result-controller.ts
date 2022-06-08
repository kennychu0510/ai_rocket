import { Request, Response } from 'express';
import { UserService } from './result-services';

export class UserController {
  constructor(private userService: UserService) {}
  create = async (req: Request, res: Response) => {
    const user = String(req.body.user);
    const timeTaken = String(req.body.timeTaken);
    const id = Number(req.body.id);
    const addedResult = await this.userService.createResult({
      user,
      timeTaken,
      id,
    });
    res.json({ id: addedResult });
  };
}
