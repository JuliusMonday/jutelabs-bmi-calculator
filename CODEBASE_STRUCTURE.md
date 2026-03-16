# Codebase Structure & Architecture Documentation

## Overview

This project is a full-stack application composed of three main microservices/components:
1.  **Backend (Node.js/Express)**: Acts as the API Gateway and orchestrator.
2.  **AI Service (Python/FastAPI)**: Provides specialized AI analysis and calculation logic.
3.  **Frontend (React)**: The user interface (likely running on port 5173).

## Directory Structure

```text
/Users/jutelabs/Desktop/jutelabs-bmi-calculator
├── ai-service/          # Python FastAPI Service
│   ├── main.py          # Entry point and route definitions
│   ├── .env             # Environment variables (API Keys)
│   └── .venv/           # Python Virtual Environment
├── backend/             # Node.js Express Backend
│   ├── server.js        # Server entry point
│   ├── package.json     # Dependencies and scripts
│   ├── .env             # Environment variables (Routes, Ports)
│   └── src/
│       ├── app.js       # App configuration and middleware
│       ├── controllers/ # Logic and AI Service Integration
│       └── routes/      # API Route definitions
├── frontend/            # React Frontend Application
└── LICENSE
```

## Backend - AI Service Connection

The Node.js backend connects to the Python AI service via **HTTP Requests (REST API)**.

### Communication Flow
1.  **Client Request**: The Frontend sends a request to the Node.js Backend (e.g., to `/api/analyze`).
2.  **Orchestration**: The Backend (`healthController.js`) receives the request.
3.  **The Handshake**: The Backend uses `axios` to send an HTTP POST request to the Python AI Service.
    *   The URL is retrieved from environment variables (`AI_ANALYZER_ROUTE`, `HEIGHT_CONVERTER_ROUTE`).
4.  **Processing**: The Python Service (`main.py`) processes the data (using Gemini AI or math) and returns JSON.
5.  **Response**: The Backend receives the data and forwards it back to the Frontend.

### Key Components

*   **Node.js Backend (`backend/src/controllers/healthController.js`)**:
    *   Uses `axios` for HTTP communication.
    *   Handles errors like `ECONNREFUSED` to detect if the AI service is offline.
    *   Example Call:
        ```javascript
        const pythonResponse = await axios.post(process.env.AI_ANALYZER_ROUTE, {
            weight_kg: weight,
            height_m: height
        });
        ```

*   **Python AI Service (`ai-service/main.py`)**:
    *   Built with **FastAPI**.
    *   Exposes endpoints:
        *   `POST /analyze-health`: Uses Google Gemini AI to generate health advice.
        *   `POST /convert-height`: Performs unit conversions.
    *   Uses `pydantic` models for data validation.

## Environment Configuration

To ensure the connection works, the `backend/.env` file must point to the running instance of the `ai-service`.
*   **AI Service**: Typically runs on `http://127.0.0.1:8000` (FastAPI default).
*   **Backend**: Typically runs on `http://localhost:5000`.
