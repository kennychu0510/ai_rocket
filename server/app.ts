import express from 'express';

export const app = express();
app.use(express.static('../public'));
app.use(express.json());
