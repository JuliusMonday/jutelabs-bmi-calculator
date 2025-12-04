const validateInput = (req, res, next) => {
    const { weight, height } = req.body;

    if (!weight || !height) {
        return res.status(400).json({
            success: false,
            error: "Missing required fields: weight and height are required."
        });
    }

    const weightNum = parseFloat(weight);
    const heightNum = parseFloat(height);

    if (isNaN(weightNum) || weightNum <= 0) {
        return res.status(400).json({
            success: false,
            error: "Invalid weight: must be a positive number."
        });
    }

    if (isNaN(heightNum) || heightNum <= 0 || heightNum > 3) {
        return res.status(400).json({
            success: false,
            error: "Invalid height: must be a positive number in meters (max 3m)."
        });
    }

    // Attach parsed numbers to request for controller convenience
    req.body.weight = weightNum;
    req.body.height = heightNum;

    next();
};

module.exports = validateInput;
