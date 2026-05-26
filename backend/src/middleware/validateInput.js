const validateInput = (req, res, next) => {
  const { weight, height } = req.body;

  if (weight === undefined || height === undefined) {
    return res.status(400).json({
      success: false,
      error: "Missing required fields: weight and height are required.",
    });
  }

  const weightNum = parseFloat(weight);
  const heightNum = parseFloat(height);

  if (!Number.isFinite(weightNum) || weightNum <= 0 || weightNum > 635) {
    return res.status(400).json({
      success: false,
      error:
        "Invalid weight: must be a positive number in kilograms (max 635).",
    });
  }

  if (!Number.isFinite(heightNum) || heightNum <= 0 || heightNum > 3) {
    return res.status(400).json({
      success: false,
      error: "Invalid height: must be a positive number in meters (max 3m).",
    });
  }

  req.body.weight = weightNum;
  req.body.height = heightNum;

  next();
};

module.exports = validateInput;
