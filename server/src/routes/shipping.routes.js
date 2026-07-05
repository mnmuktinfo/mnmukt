const express = require("express");
const { getServiceability } = require("../controllers/shipping.controller");

const router = express.Router();

router.get("/serviceability/:pincode", getServiceability);

module.exports = router;