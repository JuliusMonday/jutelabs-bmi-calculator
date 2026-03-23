import sys
import os

try:
    import fastapi
    print(f"FastAPI version: {fastapi.__version__}")
except ImportError:
    print("FastAPI not found")

try:
    import uvicorn
    print(f"Uvicorn version: {uvicorn.__version__}")
except ImportError:
    print("Uvicorn not found")

try:
    import google.generativeai as genai
    print("Google Generative AI found")
except ImportError:
    print("Google Generative AI not found")

print(f"Python version: {sys.version}")
print(f"Executable: {sys.executable}")
