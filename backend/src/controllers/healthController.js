const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();

const calculateHealth = async (req, res) => {
    try {
        const { weight, height } = req.body;

        console.log("1. Received data from React:", { weight, height });

        if (!weight || !height) {
            return res.status(400).json({ success: false, error: "Missing weight or height" });
        }

        // --- 2. BMI CALCULATION ---
        const bmi = Math.round((weight / (height * height)) * 10) / 10;
        
        console.log(`2. Calculated BMI: ${bmi}. Handing over to Python AI Service...`);

        // --- 3. THE HANDSHAKE (Calling Python AI Service) ---
        // Using the external AI service as requested by the user
        let aiResponse;
        try {
            const response = await axios.post('http://localhost:8000/analyze-health', {
                weight_kg: weight,
                height_m: height
            }, { timeout: 30000 }); // 30s timeout for AI

            aiResponse = response.data;
            console.log("3. Received advice from Python service");
        } catch (aiError) {
            console.error("AI Service Error:", aiError.message);
            
            let status = 500;
            let errorMessage = "AI Service currently unavailable.";
            
            if (aiError.response) {
                status = aiError.response.status;
                errorMessage = aiError.response.data?.detail || errorMessage;
            } else if (aiError.code === 'ECONNREFUSED') {
                errorMessage = "Connection to AI Service failed. Is the Python server running on port 8000?";
            }

            return res.status(status).json({ 
                success: false, 
                error: errorMessage,
                message: aiError.message
            });
        }

        // 4. Send final report to Frontend
        res.json({
            success: true,
            report: {
                bmi: aiResponse.bmi,
                advice: aiResponse.advice
            }
        });

    } catch (error) {
        console.error("Error in AI Analysis Flow:", error.message);
        res.status(500).json({ 
            success: false,
            error: "Internal Server Error during AI analysis",
            message: error.message
        });
    }
};

const convertHeight = async (req, res) => {
    try {
        let { feet, inches } = req.body;
        
        console.log("1. Received height data:", { feet, inches });

        // Normalize inputs
        let feetNum = parseFloat(feet || 0);
        let inchesNum = parseFloat(inches || 0);

        // 1 foot = 0.3048 meters
        // 1 inch = 0.0254 meters
        const meters = (feetNum * 0.3048) + (inchesNum * 0.0254);
        const roundedMeters = Math.round(meters * 100) / 100;

        console.log(`2. Conversion Detail: ${feetNum}ft + ${inchesNum}in = ${meters.toFixed(4)}m -> Rounded: ${roundedMeters}m`);

        res.json({
            success: true,
            meters: roundedMeters
        });

    } catch (error) {
        console.error("Error converting height:", error.message);
        res.status(500).json({ error: "Internal Conversion Error" });
    }
};

module.exports = {
    calculateHealth,
    convertHeight
};
