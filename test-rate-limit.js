#!/usr/bin/env node
// @ts-check

/**
 * Test script to demonstrate rate limiting
 *
 * Usage: node test-rate-limit.js [endpoint] [requests] [concurrency]
 *
 * Examples:
 * node test-rate-limit.js              # Test standard endpoint with 150 requests
 * node test-rate-limit.js premium 200  # Test premium endpoint with 200 requests
 * node test-rate-limit.js public 100 5 # Test public endpoint with 100 requests, 5 at a time
 */

import http from "http";
import { performance } from "perf_hooks";

// Configuration
const config = {
  host: "localhost",
  port: 3000,
  endpoint: process.argv[2] || "public", // Default to public endpoint
  requests: parseInt(process.argv[3]) || 1500, // Default to 1500 requests
  concurrency: parseInt(process.argv[4]) || 10, // Default to 10 concurrent requests
  delayMs: 10, // Small delay between requests to see rate limiting in action
};

// Counter for tracking successful and rate-limited requests
const stats = {
  success: 0,
  rateLimited: 0,
  other: 0,
  startTime: 0,
  endTime: 0,
};

console.log(`
Rate Limiter Test Script
------------------------
Endpoint: /api/${config.endpoint}
Total Requests: ${config.requests}
Concurrency: ${config.concurrency}
`);

/**
 * Make a single request to the API
 * @returns {Promise} Promise resolving with the response
 */
function makeRequest() {
  return new Promise((resolve) => {
    const options = {
      host: config.host,
      port: config.port,
      path: `/api/${config.endpoint}`,
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    };

    const req = http.request(options, (res) => {
      const { statusCode } = res;
      let rawData = "";

      res.on("data", (chunk) => {
        rawData += chunk;
      });

      res.on("end", () => {
        let data = null;
        try {
          if (rawData) data = JSON.parse(rawData);
        } catch (e) {
          console.error("Error parsing response:", e.message);
        }

        // Collect rate limit headers
        const rateLimitLimit = res.headers["x-ratelimit-limit"];
        const rateLimitRemaining = res.headers["x-ratelimit-remaining"];
        const rateLimitReset = res.headers["x-ratelimit-reset"];
        const retryAfter = res.headers["retry-after"];

        // Update stats based on response
        if (statusCode === 200) {
          stats.success++;
        } else if (statusCode === 429) {
          stats.rateLimited++;
        } else {
          stats.other++;
        }

        resolve({
          statusCode,
          data,
          headers: {
            rateLimitLimit,
            rateLimitRemaining,
            rateLimitReset,
            retryAfter,
          },
        });
      });
    });

    req.on("error", (e) => {
      console.error(`Request error: ${e.message}`);
      stats.other++;
      resolve({ statusCode: 0, error: e.message });
    });

    req.end();
  });
}

/**
 * Process a batch of requests with controlled concurrency
 */
async function processRequests() {
  stats.startTime = performance.now();
  let completedRequests = 0;
  const batch = [];

  console.log("Starting requests...\n");

  // Helper function to process a single request with logging
  async function processRequest(requestNumber) {
    try {
      const result = await makeRequest();
      completedRequests++;

      // Log interesting responses (first few, rate limited ones, etc.)
      const shouldLog =
        completedRequests <= 3 || result.statusCode === 429 || completedRequests % 10 === 0;

      if (shouldLog) {
        if (result.statusCode === 200) {
          console.log(
            `✅ #${requestNumber}: Success - Remaining: ${result.headers.rateLimitRemaining}/${result.headers.rateLimitLimit}`
          );
        } else if (result.statusCode === 429) {
          console.log(
            `❌ #${requestNumber}: Rate Limited - Retry After: ${result.headers.retryAfter}s`
          );
        } else {
          console.log(`❓ #${requestNumber}: Status ${result.statusCode}`);
        }
      }

      // Add small delay between requests
      await new Promise((resolve) => setTimeout(resolve, config.delayMs));

      // Start printing status updates
      if (completedRequests % 10 === 0 || completedRequests === config.requests) {
        const progress = Math.floor((completedRequests / config.requests) * 100);
        process.stdout.write(
          `\rProgress: ${progress}% (${completedRequests}/${config.requests}) - Success: ${stats.success}, Rate Limited: ${stats.rateLimited}`
        );
      }
    } catch (error) {
      console.error(`Error processing request #${requestNumber}:`, error);
    }
  }

  // Process requests with limited concurrency
  for (let i = 0; i < config.requests; i++) {
    if (batch.length >= config.concurrency) {
      await Promise.race(batch);
    }

    const requestNumber = i + 1;
    const requestPromise = processRequest(requestNumber);

    // Remove the promise from the batch when it resolves
    requestPromise.then(() => {
      const index = batch.indexOf(requestPromise);
      if (index !== -1) batch.splice(index, 1);
    });

    batch.push(requestPromise);
  }

  // Wait for any remaining requests to complete
  await Promise.all(batch);

  stats.endTime = performance.now();
}

// Run the test
processRequests()
  .then(() => {
    const duration = (stats.endTime - stats.startTime) / 1000;

    console.log("\n\nTest Complete!");
    console.log("---------------------------");
    console.log(`Duration: ${duration.toFixed(2)} seconds`);
    console.log(`Successful requests: ${stats.success}`);
    console.log(`Rate limited requests: ${stats.rateLimited}`);
    console.log(`Other responses: ${stats.other}`);
    console.log(`Requests per second: ${(config.requests / duration).toFixed(2)}`);

    if (stats.rateLimited > 0) {
      console.log("\n✅ Rate limiting is working! Some requests were rate limited as expected.");
    } else {
      console.log(
        "\n⚠️ No requests were rate limited. Try increasing the number of requests or reducing the rate limit in the config."
      );
    }
  })
  .catch((error) => {
    console.error("Test failed:", error);
  });
