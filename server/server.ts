import { print } from 'listening-on';
import { env } from './env';
import { app } from './app';

const PORT = env.PORT;
app.listen(PORT, () => {
  print(PORT);
});
