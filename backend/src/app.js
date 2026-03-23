const express = require('express');
const cors = require('cors');
const healthRoutes = require('./routes/healthRoutes');

const app = express();

// Middleware
app.use(express.json());
app.use(cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:8000', 'http://127.0.0.1:8000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

// Routes
app.use('/api', healthRoutes);

app.get("/", (req, res) => {
    res.json({ message: "Welcome to the BMI Calculator API!" });
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date() });
});

// 404 Handler
app.use((req, res) => {
    res.status(404).json({ error: "Endpoint not found" });
});

module.exports = app;
