import redisClient from '../utils/initRedis.js'

function rateLimit(options) {
  const { windowMs, maxRequests } = options;

  return async function(req, res, next) {
    const ip = req.headers['x-forwarded-for'] || req.ip;
    console.log('IP:', ip);

    const currentTimestamp = Date.now();

    await redisClient.zadd(`rateLimit:${ip}`, currentTimestamp, currentTimestamp);     // Add the current request to the sorted set for this IP

    await redisClient.zremrangebyscore(`rateLimit:${ip}`, 0, currentTimestamp - windowMs);     // Remove requests that are older than the rate limit window

    const requestCount = await redisClient.zcard(`rateLimit:${ip}`);     // Get the number of requests in the rate limit window

    if (requestCount <= maxRequests) {
      next();
    } else {
      res.status(429).json({ status: 'error', message: 'Too Many Requests, Try after 1 hour', statusCode: 429});
    }
  };
}

const limiter = rateLimit({ windowMs: 60 * 60 * 1000, maxRequests: 500 });

export default limiter;