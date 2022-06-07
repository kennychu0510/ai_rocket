/* eslint-disable new-cap */
/* eslint-disable @typescript-eslint/no-var-requires */
import Knex, { Knex as KnexType } from 'knex';

const configs = require('../knexfile');
const mode = 'development';
const config = configs[mode];

export const knex: KnexType = Knex(config);
