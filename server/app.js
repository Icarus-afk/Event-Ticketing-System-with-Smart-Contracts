import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import userRoutes from './routes/users.js';
import eventRoutes from './routes/events.js';
import ticketRoutes from './routes/tickets.js';
import errorHandler from './middleware/errorHandler.js';
import logger from './middleware/logger.js';
import limiter from './middleware/rateLimiter.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import dotenv from 'dotenv';


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

const store = MongoStore.create({ mongoUrl: process.env.MONGO_STRING });

app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));

app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    store: store
  }));
  
// app.use(cors({
//     origin: ['http://localhost:5173', 'http://localhost:8000'], 
//     credentials: true
// }));
// // app.use(cors("*"));  
app.use(cors());
app.use(errorHandler);
app.use(logger);
app.use(limiter);

app.use('/user', userRoutes);
app.use('/event', eventRoutes);
app.use('/ticket', ticketRoutes);
app.use('/images/event', express.static(path.join(__dirname, 'images/event')));
app.use('/images/user_image', express.static(path.join(__dirname, 'images/user_image')));




export default app;