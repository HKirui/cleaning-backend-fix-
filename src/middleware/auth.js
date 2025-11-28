const jwt = require('jsonwebtoken');

module.exports = function (roles = []) {
  // Allow string "admin" or ["admin", "cleaner"]
  if (typeof roles === "string") {
    roles = [roles];
  }

  return (req, res, next) => {
    const header = req.headers.authorization;

    if (!header) {
      return res.status(401).json({ error: "No authorization header" });
    }

    const token = header.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "Token missing" });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Attach user to request
      req.user = {
        userId: decoded.userId,
        userType: decoded.userType
      };

      // If the route requires roles but user has no permission
      if (roles.length > 0 && !roles.includes(decoded.userType)) {
        return res.status(403).json({ error: "Unauthorized for this action" });
      }

      next();
    } catch (err) {
      console.error("AUTH ERROR:", err.message);
      return res.status(401).json({ error: "Invalid or expired token" });
    }
  };
};
