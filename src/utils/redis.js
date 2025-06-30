import { createClient } from "redis";
import config from "../config/index.js";

// Create Redis client
export const createRedisClient = async () => {
  const client = createClient({
    url: config.redis.uri,
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

  await client.connect().catch((err) => {
    console.error("Failed to connect to Redis:", err);
  });

  return client;
};
