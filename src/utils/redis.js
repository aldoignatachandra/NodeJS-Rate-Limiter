import { createClient } from "redis";
import config from "../config/index.js";

// Create Redis client
export const createRedisClient = async () => {
  try {
    const client = createClient({
      url: config.redis.uri,
      legacyMode: true,
    });

    client.on("error", (err) => {
      console.error("Redis error:", err);
    });

    client.on("connect", () => {
      console.info("Redis connected successfully");
    });

    client.on("reconnecting", () => {
      console.info("Redis reconnecting...");
    });

    // Connect client
    await client.connect();

    // Return client in a compatible way
    return client.v4 ? client : client;
  } catch (err) {
    console.error("Failed to create Redis client:", err);
    throw err; // Rethrow to ensure app doesn't start with broken Redis
  }
};
