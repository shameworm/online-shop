function protectRoutes(req, res, next) {
  if (!res.locals.isAuth) {
    const error = new Error("Unauthorized");
    error.statusCode = 401;
    return next(error);
  }

  if (req.path.startsWith("/admin") && !res.locals.isAdmin) {
    const error = new Error("Forbidden");
    error.statusCode = 403;
    return next(error);
  }

  next();
}

module.exports = protectRoutes;
