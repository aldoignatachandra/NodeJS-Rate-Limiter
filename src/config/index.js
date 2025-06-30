import dotenv from "dotenv";
dotenv.config();

export default {
  env: process.env.NODE_ENV || "development",
  port: process.env.PORT || 3000,
  redis: {
    uri: process.env.REDIS_URI || "redis://localhost:6379",
  },
  rateLimits: {
    // Standard API limits: 100 requests per 15 minutes
    standard: {
      points: 100,
      duration: 15 * 60, // in seconds
    },
    // Premium API limits: 500 requests per 15 minutes
    premium: {
      points: 500,
      duration: 15 * 60, // in seconds
    },
    // Status API limits: 1000 requests per hour
    status: {
      points: 1000,
      duration: 60 * 60, // in seconds
    },
  },
};
