import { RateLimiterRedis, RateLimiterMemory } from "rate-limiter-flexible";

/**
 * Fixed Window Rate Limiter Strategy
 * Limits requests based on fixed time windows (e.g., 100 requests per hour)
 * @param {Object} redisClient - Redis client
 * @param {Object} options - Configuration options
 * @returns {Object} RateLimiterRedis instance
 */
export const createFixedWindowLimiter = (redisClient, options = {}) => {
  return new RateLimiterRedis({
    storeClient: redisClient,
    keyPrefix: "fixedWindow",
    points: options.points || 100,
    duration: options.duration || 3600, // 1 hour in seconds
  });
};

/**
 * Sliding Window Rate Limiter Strategy
 * More sophisticated approach with better distribution over time
 * @param {Object} redisClient - Redis client
 * @param {Object} options - Configuration options
 * @returns {Object} RateLimiterRedis instance with window shift
 */
export const createSlidingWindowLimiter = (redisClient, options = {}) => {
  return new RateLimiterRedis({
    storeClient: redisClient,
    keyPrefix: "slidingWindow",
    points: options.points || 100,
    duration: options.duration || 3600, // 1 hour in seconds
    execEvenly: true, // Try to distribute requests evenly
    blockDuration: options.blockDuration || 0,
  });
};

/**
 * Token Bucket Rate Limiter Strategy
 * Models rate limiting using a bucket of tokens that refill at a fixed rate
 * (Implemented via RateLimiterRedis with token refill)
 * @param {Object} redisClient - Redis client
 * @param {Object} options - Configuration options
 * @returns {Object} RateLimiterRedis instance with token bucket behavior
 */
export const createTokenBucketLimiter = (redisClient, options = {}) => {
  return new RateLimiterRedis({
    storeClient: redisClient,
    keyPrefix: "tokenBucket",
    points: options.points || 100, // Bucket size
    duration: options.duration || 3600, // Refill period (1 hour)
    inmemoryBlockOnConsumed: options.points || 100, // Block when bucket is empty
    inmemoryBlockDuration: 1, // Block for just enough time for token refill
  });
};

/**
 * IP-based Rate Limiter
 * Different limits for different IP addresses or IP ranges
 * @param {Object} redisClient - Redis client
 * @param {Object} options - Configuration options
 * @returns {Function} Middleware function that applies appropriate limits
 */
export const createIpBasedLimiter = (redisClient, options = {}) => {
  // Create different rate limiters for different IPs
  const defaultLimiter = new RateLimiterRedis({
    storeClient: redisClient,
    keyPrefix: "ip:default",
    points: options.defaultPoints || 100,
    duration: options.defaultDuration || 3600,
  });

  const trustedLimiter = new RateLimiterRedis({
    storeClient: redisClient,
    keyPrefix: "ip:trusted",
    points: options.trustedPoints || 500,
    duration: options.trustedDuration || 3600,
  });

  const restrictedLimiter = new RateLimiterRedis({
    storeClient: redisClient,
    keyPrefix: "ip:restricted",
    points: options.restrictedPoints || 20,
    duration: options.restrictedDuration || 3600,
  });

  // Example trusted and restricted IP ranges
  // In real implementation, you would fetch these from a database or config
  const trustedIps = options.trustedIps || ["127.0.0.1", "::1"];
  const restrictedIps = options.restrictedIps || [];

  // Return middleware that selects appropriate limiter
  return async (req, res, next) => {
    try {
      const ip = req.ip;
      let limiter;

      if (trustedIps.includes(ip)) {
        limiter = trustedLimiter;
      } else if (restrictedIps.includes(ip)) {
        limiter = restrictedLimiter;
      } else {
        limiter = defaultLimiter;
      }

      const rateLimiterRes = await limiter.consume(ip);

      // Set headers
      res.set({
        "X-RateLimit-Limit": limiter.points,
        "X-RateLimit-Remaining": rateLimiterRes.remainingPoints,
        "X-RateLimit-Reset": new Date(Date.now() + rateLimiterRes.msBeforeNext).toISOString(),
      });

      next();
    } catch (err) {
      if (err.remainingPoints !== undefined) {
        res.set({
          "X-RateLimit-Limit": err.limit || 0,
          "X-RateLimit-Remaining": err.remainingPoints,
          "X-RateLimit-Reset": new Date(Date.now() + err.msBeforeNext).toISOString(),
          "Retry-After": Math.ceil(err.msBeforeNext / 1000),
        });

        res.status(429).json({
          error: "Too Many Requests",
          message: "Rate limit exceeded. Please try again later.",
          retryAfter: Math.ceil(err.msBeforeNext / 1000),
        });
      } else {
        next(err);
      }
    }
  };
};

/**
 * User-based Rate Limiter
 * Different limits for authenticated vs anonymous users
 * @param {Object} redisClient - Redis client
 * @param {Object} options - Configuration options
 * @returns {Function} Middleware function that applies appropriate limits
 */
export const createUserBasedLimiter = (redisClient, options = {}) => {
  // Create different rate limiters for different user types
  const anonymousLimiter = new RateLimiterRedis({
    storeClient: redisClient,
    keyPrefix: "user:anonymous",
    points: options.anonymousPoints || 50,
    duration: options.anonymousDuration || 3600,
  });

  const authenticatedLimiter = new RateLimiterRedis({
    storeClient: redisClient,
    keyPrefix: "user:authenticated",
    points: options.authenticatedPoints || 200,
    duration: options.authenticatedDuration || 3600,
  });

  // Return middleware that selects appropriate limiter
  return async (req, res, next) => {
    try {
      // In a real app, you would check if user is authenticated
      // For this example, we'll just use a req.user property that would be set by auth middleware
      const isAuthenticated = req.user !== undefined;
      const limiter = isAuthenticated ? authenticatedLimiter : anonymousLimiter;

      // Use either user ID or IP as the rate limiting key
      const key = isAuthenticated ? req.user.id : req.ip;

      const rateLimiterRes = await limiter.consume(key);

      // Set headers
      res.set({
        "X-RateLimit-Limit": limiter.points,
        "X-RateLimit-Remaining": rateLimiterRes.remainingPoints,
        "X-RateLimit-Reset": new Date(Date.now() + rateLimiterRes.msBeforeNext).toISOString(),
      });

      next();
    } catch (err) {
      if (err.remainingPoints !== undefined) {
        res.set({
          "X-RateLimit-Limit": err.limit || 0,
          "X-RateLimit-Remaining": err.remainingPoints,
          "X-RateLimit-Reset": new Date(Date.now() + err.msBeforeNext).toISOString(),
          "Retry-After": Math.ceil(err.msBeforeNext / 1000),
        });

        res.status(429).json({
          error: "Too Many Requests",
          message: "Rate limit exceeded. Please try again later.",
          retryAfter: Math.ceil(err.msBeforeNext / 1000),
        });
      } else {
        next(err);
      }
    }
  };
};

// Fallback memory-based limiter (useful when Redis is not available)
export const createMemoryLimiter = (options = {}) => {
  return new RateLimiterMemory({
    points: options.points || 100,
    duration: options.duration || 60,
    keyPrefix: "memory",
  });
};
