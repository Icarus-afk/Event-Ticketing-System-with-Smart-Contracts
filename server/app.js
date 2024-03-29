import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import userRoutes from './routes/users.js';
import eventRoutes from './routes/events.js';
import errorHandler from './middleware/errorHandler.js';
import logger from './middleware/logger.js';

const app = express();

app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));

app.use(cors());
app.use(errorHandler);
app.use(logger);

app.use('/user', userRoutes);
app.use('/event', eventRoutes);



export default app;