const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Access Denied: No Token Provided" });
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET || "supersecretjwtkey123456!");
    req.user = verified; // Should contain { id, email, role, shopId }
    next();
  } catch (err) {
    res.status(403).json({ message: "Access Denied: Invalid or Expired Token" });
  }
};

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access Denied: Unauthorized Role Permissions" });
    }
    next();
  };
};

module.exports = { verifyToken, authorizeRoles };
