const crypto = require("crypto");

module.exports = (req, res, next) => {
    req.id = crypto.randomUUID();
    next();
};