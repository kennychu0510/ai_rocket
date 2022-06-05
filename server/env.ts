import { config } from 'dotenv';
import populateEnv from 'populate-env';

config();

export const env = {
  DB_NAME: '',
  DB_USERNAME: '',
  DB_PASSWORD: '',
  PORT: 8100,
};

populateEnv(env);
