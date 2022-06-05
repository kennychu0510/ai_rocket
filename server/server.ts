import { print } from 'listening-on';
import express from 'express';
import { env } from './env';

const app = express();
app.use(express.json());

const PORT = env.PORT;
app.listen(PORT, ()=>{
  print(PORT);
});

