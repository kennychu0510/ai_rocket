import express from 'express';
import { mapController } from './app';

export const routes = express.Router();

// star map routes
routes.get('/mode', mapController.get);
routes.post('/map', mapController.create);
