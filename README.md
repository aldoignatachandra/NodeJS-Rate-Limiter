# Node.js Rate Limiter Demo

This project demonstrates implementing rate limiting in a Node.js backend application using Express and Redis.

## Features

- Express.js REST API with clean architecture
- Rate limiting implementation using `rate-limiter-flexible`
- Redis integration for distributed rate limiting
- Multiple rate limiting strategies
- Well-structured codebase following best practices

## Prerequisites

- Node.js (v20 or higher)
- Redis server

## Installation

1. Clone this repository
2. Install dependencies:

```bash
npm install /  yarn install
```

3. Make sure Redis is running locally or update the `.env` file with your Redis URI
4. Start the server:

```bash
# Development mode with hot-reloading
npm run dev / yarn dev

# Production mode
npm start / yarn start
```

## Rate Limiting Strategies

This project demonstrates several rate limiting strategies:

1. **Fixed Window** - Limits requests based on a fixed time window
2. **Sliding Window** - More sophisticated approach that considers request distribution
3. **Token Bucket** - Models rate limiting using a bucket of tokens that refill at a fixed rate
4. **IP-based Limiting** - Different limits for different IP addresses
5. **User-based Limiting** - Different limits based on authentication status

## API Endpoints

- `GET /api/public` - Public endpoint with standard rate limiting
- `GET /api/premium` - Premium endpoint with higher rate limits
- `GET /api/status` - Status endpoint to check remaining quota

## Environment Variables

- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment (development/production)
- `REDIS_URI` - Redis connection string

## Project Structure

```
src/
  ├── config/       # Configuration files
  ├── controllers/  # Route controllers
  ├── middleware/   # Custom middleware including rate limiters
  ├── routes/       # API routes
  ├── services/     # Business logic
  ├── utils/        # Utility functions
  └── app.js        # Application entry point
```

## License

ISC
