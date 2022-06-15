import express from 'express';
import { mapController, userController, userRankingController } from './app';

export const routes = express.Router();


// star map routes
routes.get('/mode', mapController.get);
routes.post('/map', mapController.create);
routes.post('/scores', userController.create);
routes.get('/rankingForm', userRankingController.get);

