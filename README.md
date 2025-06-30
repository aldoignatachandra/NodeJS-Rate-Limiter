# Node.js Rate Limiter Demo

![Node.js](https://img.shields.io/badge/Node.js-20.x-green)
![Express](https://img.shields.io/badge/Express-4.x-blue)
![Redis](https://img.shields.io/badge/Redis-4.x-red)
![ES Modules](https://img.shields.io/badge/ES%20Modules-%E2%9C%93-lightgrey)

A comprehensive implementation of API rate limiting strategies in Node.js with Redis, designed for production-ready applications.

## 📋 Overview

This project demonstrates an implementation of rate limiting in Node.js backend applications using Express and Redis. It showcases multiple advanced rate limiting strategies through a clean, modular architecture that follows industry best practices.

## ✨ Features

- Modern ES6+ JavaScript with ES module syntax
- **Express.js** REST API with clean architecture patterns
- Advanced **rate limiting** using `rate-limiter-flexible`
- **Redis** integration for distributed rate limiting across multiple server instances
- Multiple rate limiting strategies ( Fixed Window, Sliding Window, Token Bucket )
- IP-based and user-based limiting approaches
- Custom middleware implementation
- Comprehensive error handling
- Rate limit headers following RFC standards
- Well-structured codebase following software engineering best practices

## 🔧 Prerequisites

- `Node.js v20+` ( ES modules support )
- `Redis server 6.0+` ( local or remote )
- `npm` or `yarn` package manager

## 📦 Installation

1. Clone the repository :

```bash
git clone https://github.com/aldoignatachandra/NodeJS-Rate-Limiter.git
cd nodejs-rate-limiter
```

2. Install dependencies :

```bash
npm install
# OR using yarn
yarn install
```

3. Configure environment variables :

```bash
# Create .env file from example
cp .env.example .env
# Edit the .env file with your preferred settings
```

4. Start Redis :

```bash
# Using provided script
./start-redis.sh
# OR using Docker directly
docker run --name redis-rate-limiter -p 6379:6379 -d redis:alpine
```

5. Start the application :

```bash
# Development mode with hot-reloading
npm run dev
# OR using yarn
yarn dev

# Production mode
npm start
# OR using yarn
yarn start
```

## 🚦 Rate Limiting Strategies

The project implements these advanced rate limiting approaches:

1. Fixed Window Rate Limiting

Limits requests to a fixed number within a specific time window (e.g., 100 requests per 15 minutes). Simple but can lead to traffic spikes at window boundaries.

```javascript
// Example configuration
{
  points: 100,         // Number of allowed requests
  duration: 60 * 15    // Window size in seconds (15 minutes)
}
```

2. Sliding Window Rate Limiting

More sophisticated approach that provides smoother request distribution by constantly moving the window forward.

```javascript
// Example configuration
{
  points: 100,         // Number of allowed requests
  duration: 60 * 15,   // Window size in seconds
  execEvenly: true     // Distributes requests evenly
}
```

3. Token Bucket Rate Limiting

Models rate limiting as a bucket of tokens that refill at a constant rate, allowing for burst handling )

```javascript
// Example configuration
{
  points: 100,                  // Bucket size
  duration: 3600,               // Refill period
  inmemoryBlockOnConsumed: 100  // Block when bucket is empty
}
```

4. IP-based Rate Limiting

Different limits for different IP addresses or IP ranges.

5. User-based Rate Limiting

Different limits based on authentication status (authenticated users vs. anonymous).

## 📡 API Endpoints

| Endpoint     | Method | Rate Limit       | Description                                |
| ------------ | ------ | ---------------- | ------------------------------------------ |
| /api/public  | GET    | 100 req / 15 min | Standard endpoint with basic rate limiting |
| /api/premium | GET    | 500 req / 15 min | Premium endpoint with higher rate limits   |
| /api/status  | GET    | 1000 req / hour  | Status endpoint to check remaining quota   |

All endpoints return rate limit information in the response headers:

- **X-RateLimit-Limit**: Maximum requests allowed in the window
- **X-RateLimit-Remaining**: Remaining requests in the current window
- **X-RateLimit-Reset**: Time when the rate limit window resets (ISO format)
- **Retry-After**: Seconds until retry is allowed (only when rate limited)

## 🔑 Environment Variables

| Variable  | Description                                 | Default Value          |
| --------- | ------------------------------------------- | ---------------------- |
| NODE_ENV  | Environment (development, production, test) | development            |
| PORT      | Port for the HTTP server                    | 3000                   |
| REDIS_URI | Redis connection string                     | redis://localhost:6379 |

## 📁 Project Structure

```
nodejs-rate-limiter/
├── src/
│   ├── config/                       # Application configuration
│   │   └── index.js                  # Central configuration management
│   ├── controllers/                  # Request handlers
│   │   └── api_controller.js         # API endpoint controllers
│   ├── middleware/                   # Express middleware
│   │   ├── error_handler.js          # Global error handling
│   │   └── rate_limiter.js           # Rate limiting middleware
│   ├── routes/                       # API routes definitions
│   │   └── api_routes.js             # API endpoint routing
│   ├── utils/                        # Utility functions
│   │   ├── rate_limit_strategies.js  # Rate limit implementation strategies
│   │   └── redis.js                  # Redis client configuration
│   └── app.js                        # Application entry point
├── .env                              # Environment variables
├── .gitignore                        # Git ignore configuration
├── package.json                      # Project dependencies and scripts
├── README.md                         # Project documentation
├── start-redis.sh                    # Helper script to start Redis
└── test-rate-limit.js                # Test script for rate limiting
```

## 🧪 Testing Rate Limits

Use the included test script to see rate limiting in action:

```bash
# Test standard endpoint with default settings (150 requests)
node test-rate-limit.js

# Test premium endpoint with 200 requests
node test-rate-limit.js premium 200

# Test public endpoint with 100 requests, 5 at a time
node test-rate-limit.js public 100 5
```

## 🔧 Development

Format code using Prettier:

```bash
npm run format
# OR
yarn format
```

## 📚 Technical Implementation

- **Rate Limiter**: Uses rate-limiter-flexible for its robust implementation and Redis support
- **Redis Integration**: Implements distributed rate limiting for multi-server setups
- **ES Module Syntax**: Uses modern JavaScript with import/export statements
- **Error Handling**: Comprehensive error handling with appropriate status codes
- **Headers**: Follows standard practices for rate limit headers

## 👨‍💻 Author

Created with 💻 by Ignata

- 📂 GitHub: [Aldo Ignata Chandra](https://github.com/aldoignatachandra)
- 💼 LinkedIn: [Aldo Ignata Chandra](https://linkedin.com/in/aldoignatachandra)

---
