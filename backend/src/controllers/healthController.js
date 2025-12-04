const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();

const calculateHealth = async (req, res) => {
    try {
        const { weight, height } = req.body;

        console.log("1. Received data from React:", { weight, height });

        // 2. Call Python (The Handshake)
        const pythonResponse = await axios.post(process.env.AI_ANALYZER_ROUTE, {
            weight_kg: weight,
            height_m: height
        });

        console.log("2. Received answer from Python:", pythonResponse.data);

        // 3. Send final report to Frontend
        res.json({
            success: true,
            report: pythonResponse.data
        });

    } catch (error) {
        console.error("Error connecting to AI Brain:", error.message);
        
        if (error.code === 'ECONNREFUSED') {
             return res.status(503).json({ 
                 success: false,
                 error: "AI Service Unavailable. Is the Python server running?" 
             });
        }

        res.status(500).json({ 
            success: false,
            error: "Internal Server Error" 
        });
    }
};

const convertHeight = async (req, res) => {
    try {
        const { feet, inches } = req.body;
        
        console.log("1. Received height data:", { feet, inches });

        const pythonResponse = await axios.post(process.env.HEIGHT_CONVERTER_ROUTE, {
            feet: parseFloat(feet),
            inches: parseFloat(inches)
        });

        console.log("2. Received conversion:", pythonResponse.data);

        res.json({
            success: true,
            meters: pythonResponse.data.meters
        });

    } catch (error) {
        console.error("Error converting height:", error.message);
        res.status(500).json({ error: "Conversion Service Unavailable" });
    }
};

module.exports = {
    calculateHealth,
    convertHeight
};
