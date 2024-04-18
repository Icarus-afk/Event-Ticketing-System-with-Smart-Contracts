import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import userRoutes from './routes/users.js';
import eventRoutes from './routes/events.js';
import ticketRoutes from './routes/tickets.js';
import errorHandler from './middleware/errorHandler.js';
import logger from './middleware/logger.js';
import limiter from './middleware/rateLimiter.js';

const app = express();

app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));

app.use(cors({
    origin: 'http://localhost:5173', // replace with the origin of your client app
    credentials: true
  }));
  
app.use(errorHandler);
app.use(logger);
app.use(limiter);

app.use('/user', userRoutes);
app.use('/event', eventRoutes);
app.use('/ticket', ticketRoutes);



export default app;