const express = require('express');
const router = express.Router();
const { calculateHealth, convertHeight } = require('../controllers/healthController');
const validateInput = require('../middleware/validateInput');

// POST /api/calculate
router.post('/calculate', validateInput, calculateHealth);

// POST /api/convert-height
router.post('/convert-height', convertHeight);

module.exports = router;
