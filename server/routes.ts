import express from 'express';
import { starMapController } from './app';

export const routes = express.Router();

// star map routes
routes.get('/star-map', starMapController.get);
routes.post('/star-map', starMapController.create);

routes.post('/test', starMapController.test);

