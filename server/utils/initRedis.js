import Redis from 'ioredis';
import logger from './consoleLogger.js'

const redisClient = new Redis({
    host: 'localhost',
    port: 6379, 
  });
  redisClient.on('connect', () => {
   logger.info('Connected to Redis');
  });
  
  redisClient.on('error', (err) => {
    logger.error('Redis connection error:', err);
  });
  
  export default redisClient;
