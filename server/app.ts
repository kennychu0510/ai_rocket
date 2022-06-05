import express from 'express';
import path from 'path';

export const app = express();
app.use(express.static('../public'));
app.use(express.json());

app.post('/save-stars', (req, res) => {
  const starMap = req.body;
  console.log(starMap);
});

/* PUT AT THE VERY BOTTOM */
app.use((req, res) => {
  res.status(404).sendFile(path.resolve(path.join('../public', '404.html')));
});
