const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const {
  calculateHealth,
  convertHeight,
} = require("../controllers/healthController");
const {
  validateCalculate,
  validateConvertHeight,
} = require("../middleware/validation");

router.use(authMiddleware);

// POST /api/calculate
router.post("/calculate", validateCalculate, calculateHealth);

// POST /api/convert-height
router.post("/convert-height", validateConvertHeight, convertHeight);

module.exports = router;
