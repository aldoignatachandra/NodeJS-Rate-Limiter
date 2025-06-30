import express from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import config from "./config/index.js";
import { createRedisClient } from "./utils/redis.js";
import { createStandardLimiter } from "./middleware/rate_limiter.js";
import { errorHandler, notFound } from "./middleware/error_handler.js";
import createApiRoutes from "./routes/api_routes.js";
import { createIpBasedLimiter } from "./utils/rate_limit_strategies.js";

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

    // Create IP-based rate limiter with custom options
    const ipBasedLimiter = createIpBasedLimiter(redisClient, {
      // Standard IPs
      defaultPoints: 100,
      defaultDuration: 15 * 60, // 15 minutes

      // Trusted IPs (add your admin/internal IPs)
      trustedPoints: 500,
      trustedDuration: 15 * 60,
      trustedIps: ["127.0.0.1", "::1", "192.168.1.100"], // Add your trusted IPs

      // Restricted IPs (add problematic IPs)
      restrictedPoints: 20,
      restrictedDuration: 15 * 60,
      restrictedIps: ["192.168.1.200"], // Add IPs to restrict
    });

    // Create standard rate limiter
    const standardLimiter = createStandardLimiter(redisClient);

    // Create API routes with rate limiters
    const apiRoutes = createApiRoutes({
      standardLimiter: ipBasedLimiter,
      premiumLimiter: ipBasedLimiter,
      statusLimiter: standardLimiter,
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
