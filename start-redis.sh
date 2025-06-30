#!/bin/bash

# Simple script to start Redis in Docker for testing

echo "Starting Redis container for rate limiting testing..."

docker run --name redis-rate-limiter \
  -p 6379:6379 \
  -d \
  redis:alpine

echo "Redis started successfully on localhost:6379"
echo "To stop the container: docker stop redis-rate-limiter && docker rm redis-rate-limiter" 
