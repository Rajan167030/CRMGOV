import jwt from "jsonwebtoken";

export const authMiddleware = (req, _res, next) => {
  const authorizationHeader = req.header("authorization");

  if (!authorizationHeader?.startsWith("Bearer ")) {
    const error = new Error("Unauthorized");
    error.statusCode = 401;
    return next(error);
  }

  const token = authorizationHeader.slice("Bearer ".length);

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      id: payload.sub,
      role: payload.role,
      email: payload.email,
    };
    return next();
  } catch {
    const error = new Error("Invalid or expired token");
    error.statusCode = 401;
    return next(error);
  }
};

export const requireRole = (...roles) => (req, _res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    const error = new Error("Forbidden");
    error.statusCode = 403;
    return next(error);
  }

  return next();
};
