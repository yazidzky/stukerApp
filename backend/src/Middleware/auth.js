const jwt = require("jsonwebtoken");
module.exports = (req, res, next) => {
  const hdr = req.headers.authorization;
  if (!hdr) return res.status(401).json({ message: "Token tidak valid" });
  try {
    const token = hdr.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    req.role = decoded.role;
    next();
  } catch {
    res.status(401).json({ message: "Token tidak valid" });
  }
};
