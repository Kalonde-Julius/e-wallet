import ratelimit from "../config/Upstash.js";

const rateLimiter = async (req, res, next) => {
  try {
    // Use the IP as the key so each client is tracked separately
    // In a real world app, you'd put the userId or IP address as your key
    const ip = req.ip || "global"; 
    const { success } = await ratelimit.limit(ip);

    if (!success) {
      return res.status(429).json({ 
        message: "Too many requests, please try again later!" 
      });
    }

    next();
  } catch (error) {
    console.error("Error occurred while checking rate limit:", error);
    // Fail gracefully instead of crashing
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export default rateLimiter;
