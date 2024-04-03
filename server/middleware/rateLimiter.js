import Redis from 'ioredis';

const redisClient = new Redis({
    host: 'localhost',
    port: 6379, 
  });
  redisClient.on('connect', () => {
    console.log('Connected to Redis');
  });
  
  redisClient.on('error', (err) => {
    console.error('Redis connection error:', err);
  });


  function rateLimit(options) {
    const { windowMs, maxRequests } = options;

    return async function(req, res, next) {
        const ip = req.headers['x-forwarded-for'] || req.ip;
        console.log('IP:', ip); // Log the IP address

        const currentTimestamp = Date.now();

        const data = await redisClient.lrange(ip, 0, -1);

        const timestamps = data.map(Number).filter(timestamp => timestamp > currentTimestamp - windowMs);

        if (timestamps.length < maxRequests) {
            await redisClient.lpush(ip, currentTimestamp);
            await redisClient.expire(ip, windowMs / 1000);
            next();
        } else {
            res.status(429).json({ status: 'error', message: 'Too Many Requests, Try after 1 hour', statusCode: 429});        }
    };
}

const limiter = rateLimit({ windowMs: 60 * 60 * 1000, maxRequests: 500 });

// Export limiter as default
export default limiter;