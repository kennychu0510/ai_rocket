import { print } from 'listening-on';
import express from 'express';
import { env } from './env';
import { app } from './app';


const PORT = env.PORT;
app.listen(PORT, ()=>{
  print(PORT);
});

