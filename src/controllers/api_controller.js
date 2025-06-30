/**
 * Controller for the standard API endpoint
 */
export const getPublicData = (req, res) => {
  res.json({
    success: true,
    message: "This is public data from the standard API endpoint",
    endpoint: "public",
    timestamp: new Date().toISOString(),
    clientIP: req.ip,
    rateLimit: {
      limit: res.getHeader("X-RateLimit-Limit"),
      remaining: res.getHeader("X-RateLimit-Remaining"),
      reset: res.getHeader("X-RateLimit-Reset"),
    },
  });
};

/**
 * Controller for the premium API endpoint
 */
export const getPremiumData = (req, res) => {
  res.json({
    success: true,
    message: "This is premium data with higher rate limits",
    endpoint: "premium",
    timestamp: new Date().toISOString(),
    clientIP: req.ip,
    rateLimit: {
      limit: res.getHeader("X-RateLimit-Limit"),
      remaining: res.getHeader("X-RateLimit-Remaining"),
      reset: res.getHeader("X-RateLimit-Reset"),
    },
    extraData: {
      premium: true,
      features: ["higher limits", "priority processing", "enhanced data"],
    },
  });
};

/**
 * Controller for the status API endpoint
 */
export const getApiStatus = (req, res) => {
  res.json({
    success: true,
    message: "API Status",
    status: "operational",
    timestamp: new Date().toISOString(),
    clientIP: req.ip,
    version: "1.0.0",
    rateLimit: {
      limit: res.getHeader("X-RateLimit-Limit"),
      remaining: res.getHeader("X-RateLimit-Remaining"),
      reset: res.getHeader("X-RateLimit-Reset"),
    },
  });
};
