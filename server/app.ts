import express from 'express';
import path from 'path';

export const app = express();
app.use(express.static('../public'));
app.use(express.json());


/* PUT AT THE VERY BOTTOM */
app.use((req, res) => {
  res.status(404).sendFile(path.resolve(path.join('../public', '404.html')));
});
