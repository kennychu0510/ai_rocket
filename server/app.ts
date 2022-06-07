import express from 'express';
import path from 'path';
import { knex } from './knex';
import { StarMapService } from './starMap-services';
import { StarMapController } from './starMap-controller';
import { MeteoriteService } from './meteorite-services';
import { MeteoriteController } from './meteorite-controller';

const starMapService = new StarMapService(knex);
export const starMapController = new StarMapController(starMapService);

const meteoriteService = new MeteoriteService(knex);
export const meteoriteController = new MeteoriteController(meteoriteService);

import { routes } from './routes';
export const app = express();
app.use(express.static('../public'));
app.use(express.json());

app.use('/', routes);


/* PUT AT THE VERY BOTTOM */
app.use((req, res) => {
  res.status(404).sendFile(path.resolve(path.join('../public', '404.html')));
});
