const allowRoles = (...allowedRoles) => {
  return (req, res, next) => {
    // req.user authMiddleware se milta hai
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to access this route",
      });
    }

    next();
  };
};

module.exports = { allowRoles };
