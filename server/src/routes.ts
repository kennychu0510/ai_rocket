import express from 'express';
import { mapController, userController, rocketAIController } from './app';

export const routes = express.Router();

// star map routes
routes.get('/mode', mapController.get);
routes.post('/map', mapController.create);
routes.post('/scores', userController.create);
routes.post('/rocketAI', rocketAIController.create);
routes.get('/rocketAI/mapID/:mapID/aiMode/:aiMode', rocketAIController.getAll);
routes.get('/rocketAI/id/:id', rocketAIController.get);
