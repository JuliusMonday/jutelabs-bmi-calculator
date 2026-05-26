const { checkSchema, validationResult } = require("express-validator");

const calculateSchema = {
  weight: {
    in: ["body"],
    isFloat: {
      options: { gt: 0, lt: 636 },
      errorMessage:
        "Invalid weight: a positive number less than or equal to 635 kg is required.",
    },
    toFloat: true,
    trim: true,
  },
  height: {
    in: ["body"],
    isFloat: {
      options: { gt: 0, lt: 3.01 },
      errorMessage:
        "Invalid height: a positive number in meters (max 3m) is required.",
    },
    toFloat: true,
    trim: true,
  },
};

const convertHeightSchema = {
  feet: {
    in: ["body"],
    isFloat: {
      options: { min: 0, max: 8 },
      errorMessage: "Invalid feet: must be between 0 and 8.",
    },
    toFloat: true,
    trim: true,
  },
  inches: {
    in: ["body"],
    isFloat: {
      options: { min: 0, lt: 12 },
      errorMessage: "Invalid inches: must be between 0 and 11.99.",
    },
    toFloat: true,
    trim: true,
  },
};

const validateSchema = (schema) => [
  checkSchema(schema),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const firstError = errors.array({ onlyFirstError: true })[0];
      return res.status(400).json({ success: false, error: firstError.msg });
    }
    next();
  },
];

module.exports = {
  validateCalculate: validateSchema(calculateSchema),
  validateConvertHeight: validateSchema(convertHeightSchema),
};
