import express from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import config from "./config/index.js";
import { createRedisClient } from "./utils/redis.js";
import {
  createStandardLimiter,
  createPremiumLimiter,
  createStatusLimiter,
} from "./middleware/rate_limiter.js";
import { errorHandler, notFound } from "./middleware/error_handler.js";
import createApiRoutes from "./routes/api_routes.js";

// Initialize Express app
const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Initialize and connect Redis
const initializeApp = async () => {
  try {
    // Create Redis client
    const redisClient = await createRedisClient();

    // Create rate limiters with Redis
    const standardLimiter = createStandardLimiter(redisClient);
    const premiumLimiter = createPremiumLimiter(redisClient);
    const statusLimiter = createStatusLimiter(redisClient);

    // Create API routes with rate limiters
    const apiRoutes = createApiRoutes({
      standardLimiter,
      premiumLimiter,
      statusLimiter,
    });

    // Mount API routes
    app.use("/api", apiRoutes);

    // Basic root endpoint
    app.get("/", (req, res) => {
      res.json({
        message: "Node.js Rate Limiter Demo API",
        docs: "Visit /api/status for API status and rate limit information",
      });
    });

    // Error handling middleware
    app.use(notFound);
    app.use(errorHandler);

    // Start the server
    const PORT = config.port;
    app.listen(PORT, () => {
      console.log(`Server running in ${config.env} mode on port ${PORT}`);
      console.log(`API available at http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error("Failed to initialize application:", error);
    process.exit(1);
  }
};

// Start the application
initializeApp();

export default app;
