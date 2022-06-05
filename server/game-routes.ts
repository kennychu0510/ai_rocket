import express from 'express';
import { Client } from 'pg';
import { GameController } from './game-controller';
import { GameService } from './game-service';

export const gameRoutes = express.Router();

const client = new Client();
const gameService = new GameService(client);
const gameController = new GameController(gameService);
