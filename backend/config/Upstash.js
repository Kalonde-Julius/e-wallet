import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";
import "dotenv/config";

// Initialize Redis from environment variables
const redis = Redis.fromEnv();

// Configure the rate limiter
const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, "60 s"), // 100 requests per 60 seconds
  analytics: true, // optional, enables logging/metrics
});

export default ratelimit;
