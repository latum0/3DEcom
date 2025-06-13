import dotenv from "dotenv";
dotenv.config();

import jwt from "jsonwebtoken";

export const auth = (req, res, next) => {
  const authHeader = req.header("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ 
      success: false,
      message: "Authorization header missing or malformed"
    });
  }

  const token = authHeader.split(" ")[1];
  console.log("Token received:", token);
  console.log("Using secret in auth middleware:", process.env.JWT_SECRET);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded token in auth:", decoded);
    
    // Expect the token payload to be in the format: { user: { id, role } }
    if (!decoded.user || !decoded.user.id) {
      return res.status(401).json({
        success: false,
        message: "Invalid token format"
      });
    }

    // Attach user information to the request for use in subsequent middleware/controllers.
    req.user = {
      _id: decoded.user.id,
      role: decoded.user.role
    };

    next();
  } catch (err) {
    console.error("Authentication error:", err);
    const message = err.name === "TokenExpiredError" 
      ? "Session expired. Please login again."
      : "Invalid authentication token";
    res.status(401).json({ success: false, message });
  }
};
