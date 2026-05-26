const axios = require("axios");
const dotenv = require("dotenv");
const logger = require("../logger");

dotenv.config();

const AI_SERVICE_URL = (
  process.env.AI_ANALYZER_ROUTE || "http://127.0.0.1:8000/analyze-health"
).trim();

if (!AI_SERVICE_URL) {
  throw new Error("AI_ANALYZER_ROUTE environment variable must be configured.");
}

const calculateHealth = async (req, res) => {
  try {
    const { weight, height } = req.body;

    logger.debug("Received BMI calculation request");

    const weightNum = Number(weight);
    const heightNum = Number(height);

    if (!Number.isFinite(weightNum) || !Number.isFinite(heightNum)) {
      return res.status(400).json({
        success: false,
        error: "Weight and height must be valid numbers.",
      });
    }

    if (weightNum <= 0 || weightNum > 635) {
      return res.status(400).json({
        success: false,
        error:
          "Invalid weight: must be a positive number less than or equal to 635 kg.",
      });
    }

    if (heightNum <= 0 || heightNum > 3) {
      return res.status(400).json({
        success: false,
        error: "Invalid height: must be a positive number in meters (max 3m).",
      });
    }

    const bmi = Math.round((weightNum / (heightNum * heightNum)) * 10) / 10;

    logger.info("Calculated BMI %s; forwarding request to AI service", bmi);

    let aiResponse;
    try {
      const response = await axios.post(
        AI_SERVICE_URL,
        {
          weight_kg: weightNum,
          height_m: heightNum,
        },
        { timeout: 30000 },
      );

      aiResponse = response.data;
      logger.debug("Received advice from Python service");
    } catch (aiError) {
      logger.error("AI Service Error: %s", aiError.message);

      let status = 500;
      let errorMessage = "AI service currently unavailable.";

      if (aiError.response) {
        status = aiError.response.status;
        errorMessage =
          aiError.response.data?.error ||
          aiError.response.data?.detail ||
          errorMessage;
      } else if (aiError.code === "ECONNREFUSED") {
        errorMessage =
          "Connection to AI service failed. Is the Python server running on port 8000?";
      }

      return res.status(status).json({
        success: false,
        error: errorMessage,
      });
    }

    if (
      !aiResponse ||
      typeof aiResponse.advice !== "string" ||
      typeof aiResponse.bmi !== "number"
    ) {
      logger.error("Invalid AI service payload: %o", aiResponse);
      return res.status(502).json({
        success: false,
        error: "Invalid response from the AI analyzer.",
      });
    }

    res.json({
      success: true,
      report: {
        bmi: aiResponse.bmi,
        advice: aiResponse.advice,
      },
    });
  } catch (error) {
    logger.error("Error in AI Analysis Flow: %s", error.message);
    res.status(500).json({
      success: false,
      error: "Internal Server Error during AI analysis",
    });
  }
};

const convertHeight = async (req, res) => {
  try {
    const { feet, inches } = req.body;

    logger.debug("Received height conversion request: %o", { feet, inches });

    const feetNum = parseFloat(feet || 0);
    const inchesNum = parseFloat(inches || 0);

    if (!Number.isFinite(feetNum) || !Number.isFinite(inchesNum)) {
      return res.status(400).json({
        success: false,
        error: "Feet and inches must be valid numbers.",
      });
    }

    if (feetNum < 0 || feetNum > 8 || inchesNum < 0 || inchesNum >= 12) {
      return res.status(400).json({
        success: false,
        error:
          "Invalid height conversion values: feet must be 0–8 and inches must be 0–11.99.",
      });
    }

    const meters = feetNum * 0.3048 + inchesNum * 0.0254;
    const roundedMeters = Math.round(meters * 100) / 100;

    logger.debug(
      "Conversion Detail: %s ft + %s in = %s m -> Rounded: %s m",
      feetNum,
      inchesNum,
      meters.toFixed(4),
      roundedMeters,
    );

    res.json({
      success: true,
      meters: roundedMeters,
    });
  } catch (error) {
    logger.error("Error converting height: %s", error.message);
    res
      .status(500)
      .json({ success: false, error: "Internal Conversion Error" });
  }
};

module.exports = {
  calculateHealth,
  convertHeight,
};
