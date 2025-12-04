import os
from dotenv import load_dotenv
from fastapi import FastAPI
from pydantic import BaseModel
import google.generativeai as genai

load_dotenv()

app = FastAPI()

api_key = os.getenv("GOOGLE_API_KEY")
genai.configure(api_key=api_key)
model = genai.GenerativeModel('gemini-2.0-flash')

class BmiRequest(BaseModel):
    weight_kg: float
    height_m: float


@app.post("/analyze-health")
def analyze_health(data: BmiRequest):
    bmi = round(data.weight_kg / (data.height_m * data.height_m), 2)
    
    prompt = f"""
    Act as a friendly but professional Nigerian Biochemist and a Nutritionist.
    My patient has a BMI of {bmi}.
    
    1. **Diagnosis:** State their clinical weight status (e.g., Normal, Overweight, Obese).
    
    2. **Metabolic Analysis:** Explain what is happening inside their body at a cellular level due to this BMI. 
       - If BMI is high (>25), explain mechanisms like **Insulin Resistance**, **Lipid Peroxidation**, or **Chronic Inflammation** caused by excess adipose tissue.
       - If BMI is normal, explain how their metabolic pathways (Glycolysis/Lipolysis) are functioning efficiently.
       - Keep the explanation accurate but easy for a layperson to understand.
       
    3. **Biochemical Advice:** Give strict lifestyle advice to optimize their metabolism (e.g., "Reduce cortisol spikes," "Improve insulin sensitivity").
    
    4. **The Prescription (Diet):** Suggest a Breakfast, Lunch, and Dinner using Nigerian foods that support metabolic health (e.g., emphasize Low Glycemic Index foods like Unripe Plantain or high-fiber vegetables).
    
    Keep the tone encouraging but scientifically grounded. Use bolding for key biochemical terms. Keep it short and friendly
    """
    
    response = model.generate_content(prompt)
    
    return {"bmi": bmi, "advice": response.text}

class HeightRequest(BaseModel):
    feet: float
    inches: float

@app.post("/convert-height")
def convert_height(data: HeightRequest):
    # 1 foot = 0.3048 meters
    # 1 inch = 0.0254 meters
    meters = (data.feet * 0.3048) + (data.inches * 0.0254)
    return {"meters": round(meters, 2)}