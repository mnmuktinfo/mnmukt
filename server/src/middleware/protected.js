const firebaseAuth = require("./firebaseAuthMiddleware");
const admin = require("./adminMiddleware");

exports.protect = [firebaseAuth];

exports.protectAdmin = [
    firebaseAuth,
    admin,
];