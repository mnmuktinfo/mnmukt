const { auth } = require("../config/firebaseAdmin");
const logger = require("../utils/logger");

/**
 * REQUIRED Auth Middleware - Throws 401 if no token
 * Use for: Routes that REQUIRE authentication
 */
const firebaseAuthMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authorization token is required.",
      });
    }

    const token = authHeader.split(" ")[1];

    if (!token || token === "undefined" || token === "null") {
      return res.status(401).json({
        success: false,
        message: "Authorization token is required.",
      });
    }

    const decodedToken = await auth.verifyIdToken(token, true);

    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email || "",
      name: decodedToken.name || "",
      phone: decodedToken.phone_number || "",
      picture: decodedToken.picture || "",
      emailVerified: decodedToken.email_verified || false,
      role: decodedToken.role || decodedToken.customClaims?.role || "user",
    };

    req.isAuthenticated = true;
    next();
  } catch (error) {
    logger("WARN", {
      requestId: req.id,
      message: "Authentication Failed",
      error: error.message,
    });

    return res.status(401).json({
      success: false,
      message: "Invalid or expired authentication token.",
    });
  }
};

/**
 * OPTIONAL Auth Middleware - Does NOT throw if no token
 * Use for: Routes that support BOTH guest and authenticated users
 * 
 * Sets:
 * - req.user = { uid, email, name, ... } if authenticated
 * - req.isAuthenticated = true/false
 * - req.isGuest = true if no token
 */
const optionalAuthMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // No token = Guest user
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      req.user = null;
      req.isAuthenticated = false;
      req.isGuest = true;
      return next();
    }

    const token = authHeader.split(" ")[1];

    // Handle frontend sending "Bearer undefined" or "Bearer null" when unauthenticated
    if (!token || token === "undefined" || token === "null") {
      req.user = null;
      req.isAuthenticated = false;
      req.isGuest = true;
      return next();
    }

    try {
      const decodedToken = await auth.verifyIdToken(token, true);

      req.user = {
        uid: decodedToken.uid,
        email: decodedToken.email || "",
        name: decodedToken.name || "",
        phone: decodedToken.phone_number || "",
        picture: decodedToken.picture || "",
        emailVerified: decodedToken.email_verified || false,
        role: decodedToken.role || decodedToken.customClaims?.role || "user",
      };

      req.isAuthenticated = true;
      req.isGuest = false;
      next();
    } catch (tokenError) {
      // Invalid token = Guest user (not authenticated)
      logger("DEBUG", {
        requestId: req.id,
        message: "Invalid token - treating as guest",
        error: tokenError.message,
      });

      req.user = null;
      req.isAuthenticated = false;
      req.isGuest = true;
      next();
    }
  } catch (error) {
    logger("ERROR", {
      requestId: req.id,
      message: "Unexpected error in optional auth",
      error: error.message,
    });

    // Continue as guest even on unexpected errors
    req.user = null;
    req.isAuthenticated = false;
    req.isGuest = true;
    next();
  }
};

/**
 * Admin Check Middleware - Only allows admin users
 * Must be used AFTER firebaseAuthMiddleware
 */
const adminMiddleware = (req, res, next) => {
  if (!req.isAuthenticated) {
    return res.status(401).json({
      success: false,
      message: "Authentication required for admin access.",
    });
  }

  if (req.user?.role !== "admin") {
    logger("WARN", {
      requestId: req.id,
      userId: req.user?.uid,
      message: "Unauthorized admin access attempt",
      role: req.user?.role,
    });

    return res.status(403).json({
      success: false,
      message: "Admin access required.",
    });
  }

  next();
};

module.exports = {
  firebaseAuthMiddleware,
  optionalAuthMiddleware,
  adminMiddleware,
};