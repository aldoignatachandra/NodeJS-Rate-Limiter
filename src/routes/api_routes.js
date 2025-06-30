import express from "express";
import * as apiController from "../controllers/api_controller.js";

/**
 * Create API routes with rate limiters
 * @param {Object} limiters - Rate limiter middleware functions
 * @returns {Object} Express router
 */
const createApiRoutes = (limiters) => {
  const router = express.Router();
  const { standardLimiter, premiumLimiter, statusLimiter } = limiters;

  // Standard API endpoint with basic rate limiting
  router.get("/public", standardLimiter, apiController.getPublicData);

  // Premium API endpoint with higher rate limits
  router.get("/premium", premiumLimiter, apiController.getPremiumData);

  // Status endpoint with its own rate limiting
  router.get("/status", statusLimiter, apiController.getApiStatus);

  return router;
};

export default createApiRoutes;
