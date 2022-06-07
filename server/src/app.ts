import express from 'express';
import path from 'path';
import { StarMapService } from './starMap-services';
import { knex } from './knex';
import { StarMapController } from './starMap-controller';
import cors from 'cors';

const starMapService = new StarMapService(knex);
export const starMapController = new StarMapController(starMapService);

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
