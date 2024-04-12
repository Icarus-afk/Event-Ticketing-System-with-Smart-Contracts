import redisClient from '../utils/initRedis.js'

function rateLimit(options) {
  const { windowMs, maxRequests } = options;

  return async function(req, res, next) {
    const ip = req.headers['x-forwarded-for'] || req.ip;
    console.log('IP:', ip); // Log the IP address

    const currentTimestamp = Date.now();

    // Get the request count for this IP
    const requestCount = Number(await redisClient.hget('rateLimit', ip)) || 0;

    if (requestCount < maxRequests) {
      // Increment the request count
      await redisClient.hincrby('rateLimit', ip, 1);
      // Set the hash to expire after windowMs milliseconds
      await redisClient.pexpire('rateLimit', windowMs);
      next();
    } else {
      res.status(429).json({ status: 'error', message: 'Too Many Requests, Try after 1 hour', statusCode: 429});
    }
  };
}

const limiter = rateLimit({ windowMs: 60 * 60 * 1000, maxRequests: 500 });

// Export limiter as default
export default limiter;