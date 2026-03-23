# JuTeLabs BMI Calculator

This project is a full-stack BMI calculator with AI-powered health advice.

## Architecture

- **Frontend**: React (Vite) - Port 5173
- **Backend (API + AI)**: Node.js (Express) - Port 5001

The AI analysis and unit conversion are handled directly by the Node.js backend using the Google Gemini SDK.

## How to Run

### 1. Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [Google Gemini API Key](https://aistudio.google.com/)

### 2. Environment Setup

#### Backend (`backend/.env`)
Create a `.env` file in the `backend` directory with:
```env
PORT=5001
GOOGLE_API_KEY=your_gemini_api_key_here
```

### 3. Running the Application

#### One Command (Recommended)
Run the following script from the root directory:
```bash
python3 start-dev.py
```

#### Manual Startup (Two Terminals)

**Terminal 1: Backend**
```bash
cd backend
npm install
npm run dev
```

**Terminal 2: Frontend**
```bash
cd frontend
npm install
npm run dev
```

## Troubleshooting
- **API Error**: Ensure your Google API Key is valid and has access to Gemini 2.0.
- **Connection Refused**: Ensure the backend is running on port 5001.
