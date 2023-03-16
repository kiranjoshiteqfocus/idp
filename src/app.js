import express from 'express';
import dotenv from 'dotenv';

//import { userRoute } from './routes';
import Routes from './routes/api.js';

dotenv.config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', Routes);
app.get('/', (req, res) => {
  res.status(200).json({ message: 'Welcome to my API' });
});

export default app;
