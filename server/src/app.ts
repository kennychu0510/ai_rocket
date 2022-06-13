import express from 'express';
import path from 'path';
import { knex } from './knex';
import { MapService } from './map-services';
import { MapController } from './map-controller';
import { UserService } from './result-services';
import { UserController } from './result-controller';
import {UserRankingService} from './user-ranking-service'
import {UserRankingController} from './user-ranking-controller'
import cors from 'cors';

const mapService = new MapService(knex);
export const mapController = new MapController(mapService);

const userService = new UserService(knex);
export const userController = new UserController(userService);

const userRankingService = new UserRankingService(knex);
export const userRankingController = new UserRankingController(userRankingService)

import { routes } from './routes';
export const app = express();
app.use(cors());
app.use(express.static('../client/build'));
app.use(express.json());


app.use('/', routes);

/* PUT AT THE VERY BOTTOM */
app.use((req, res) => {
  res
    .status(404)
    .sendFile(path.resolve(path.join('../client/build', '404.html')));
});
