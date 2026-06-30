const logger = require("../utils/logger");

const adminMiddleware = (req, res, next) => {

    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized",
        });
    }

    if (req.user.role !== "admin") {

        logger("WARN", {
            requestId: req.id,
            uid: req.user.uid,
            route: req.originalUrl,
            message: "Unauthorized admin access attempt",
        });

        return res.status(403).json({
            success: false,
            message: "Admin access required.",
        });

    }

    next();
};

module.exports = adminMiddleware;