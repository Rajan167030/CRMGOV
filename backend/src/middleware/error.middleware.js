export const requestLoggerMiddleware = (req, res, next) => {
  const startedAt = Date.now();

  res.on("finish", () => {
    if (res.statusCode >= 400) {
      console.error(
        `[${new Date().toISOString()}] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${Date.now() - startedAt}ms)`
      );
    }
  });

  next();
};

export const notFoundMiddleware = (_req, _res, next) => {
  const error = new Error("Route not found");
  error.statusCode = 404;
  next(error);
};

export const errorMiddleware = (error, req, res, _next) => {
  const statusCode = error.statusCode || 500;

  console.error(`[${new Date().toISOString()}] Route error`, {
    method: req.method,
    url: req.originalUrl,
    statusCode,
    message: error.message || "Internal server error",
    body: req.body,
    params: req.params,
    query: req.query,
    stack: error.stack,
  });

  res.status(statusCode).json({
    message: error.message || "Internal server error",
  });
};
