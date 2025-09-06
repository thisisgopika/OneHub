import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  try {
    // 1. Check if JWT_SECRET is configured
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ error: "Server configuration error" });
    }

    // 2. Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ error: "No token provided" });
    }

    // 3. Extract token (format: "Bearer TOKEN_HERE")
    const token = authHeader.split(' ')[1]; // Get the part after "Bearer "
    
    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    // 4. Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 5. Add user info to request object
    req.user = {
      user_id: decoded.user_id,
      role: decoded.role,
      name: decoded.name
    };
    
    // 6. Allow request to continue
    next();
    
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: "Token expired" });
    } else if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: "Invalid token" });
    } else {
      console.error('Token verification error:', error);
      return res.status(500).json({ error: "Token verification failed" });
    }
  }
};