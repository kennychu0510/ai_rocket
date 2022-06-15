import express from 'express';
import {
  mapController,
  userController,
  userRankingController,
  rocketAIController,
} from './app';

export const routes = express.Router();

// star map routes
routes.get('/mapID/:id', mapController.get);
routes.post('/map', mapController.create);
routes.post('/scores', userController.create);
routes.get('/rankingForm', userRankingController.get);
routes.post('/rocketAI', rocketAIController.create);
routes.get('/rocketAI/mapID/:mapID/aiMode/:aiMode', rocketAIController.getAll);
routes.get('/rocketAI/id/:id', rocketAIController.get);
