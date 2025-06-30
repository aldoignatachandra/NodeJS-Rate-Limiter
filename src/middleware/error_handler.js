/**
 * Global error handler middleware
 */
export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  console.error(`[Error] ${statusCode} - ${message}`);

  if (err.stack && process.env.NODE_ENV === "development") {
    console.error(err.stack);
  }

  res.status(statusCode).json({
    error: {
      statusCode,
      message,
      ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    },
  });
};

/**
 * Not found middleware for handling undefined routes
 */
export const notFound = (req, res) => {
  res.status(404).json({
    error: {
      statusCode: 404,
      message: `Not Found - ${req.originalUrl}`,
    },
  });
};
