import { RateLimiterRedis } from "rate-limiter-flexible";
import config from "../config/index.js";

/**
 * Create a rate limiter middleware using Redis
 * @param {Object} redisClient - Redis client
 * @param {Object} options - Rate limiter options
 * @returns {Function} Express middleware
 */
export const createRateLimiterMiddleware = (redisClient, options) => {
  const {
    points = 100, // Number of points per duration
    duration = 60 * 15, // Duration in seconds (default: 15 minutes)
    keyPrefix = "rlflx", // Redis key prefix
  } = options;

  const rateLimiter = new RateLimiterRedis({
    storeClient: redisClient,
    points,
    duration,
    keyPrefix,
  });

  return async (req, res, next) => {
    try {
      // Use IP as rate limiting key by default
      const key = req.ip;

      // Consume 1 point from the rate limit
      const rateLimiterRes = await rateLimiter.consume(key);

      // Set rate limit headers for client awareness
      res.set({
        "X-RateLimit-Limit": points,
        "X-RateLimit-Remaining": rateLimiterRes.remainingPoints,
        "X-RateLimit-Reset": new Date(Date.now() + rateLimiterRes.msBeforeNext).toISOString(),
      });

      next();
    } catch (err) {
      if (err.remainingPoints !== undefined) {
        // Set headers even when rate limited
        res.set({
          "X-RateLimit-Limit": points,
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
        // For any other error
        console.error("Rate limiter error:", err);
        next(err);
      }
    }
  };
};

/**
 * Factory functions for specific rate limiters
 */
export const createStandardLimiter = (redisClient) => {
  return createRateLimiterMiddleware(redisClient, {
    ...config.rateLimits.standard,
    keyPrefix: "rlflx:standard",
  });
};

export const createPremiumLimiter = (redisClient) => {
  return createRateLimiterMiddleware(redisClient, {
    ...config.rateLimits.premium,
    keyPrefix: "rlflx:premium",
  });
};

export const createStatusLimiter = (redisClient) => {
  return createRateLimiterMiddleware(redisClient, {
    ...config.rateLimits.status,
    keyPrefix: "rlflx:status",
  });
};
