import express from 'express';
import { starMapController, obsMapController } from './app';


export const routes = express.Router();

// star map routes
routes.get('/easy-mode', starMapController.get);
routes.post('/star-map', starMapController.create);
routes.post('/obs-map', obsMapController.create);
routes.post('/test', starMapController.test);

