import os
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import google.generativeai as genai
from google.api_core import exceptions

load_dotenv()

app = FastAPI()

# --- 1. CORS CONFIGURATION (Essential for React) ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allows all origins. In production, change to your React URL.
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

api_key = os.getenv("GOOGLE_API_KEY")
genai.configure(api_key=api_key)

# Using gemini-2.0-flash-exp as it is confirmed to work (though currently rate limited)
model = genai.GenerativeModel('gemini-2.0-flash')

class BmiRequest(BaseModel):
    weight_kg: float
    height_m: float

class HeightRequest(BaseModel):
    feet: float
    inches: float

@app.post("/analyze-health")
def analyze_health(data: BmiRequest):
    # --- 2. ROUNDING FIX ---
    # Changed from 2 to 1 so 5.19 becomes 5.2 to match the AI's logic
    bmi = round(data.weight_kg / (data.height_m * data.height_m), 1)
    
    doctor_name = "Dr. JuTe" 

    prompt = f"""
    Act as {doctor_name}, a Senior Biochemist at JuTeLabs Technology. 
    You are speaking directly to a patient. Your tone is empathetic, professional, and scientifically grounded.
    
    The patient has a BMI of {bmi}.
    
    1. **Introduction:** - Start by introducing yourself as "{doctor_name} from JuTeLabs Technology".
       - Address the patient directly using "You".
    
    2. **Diagnosis:** - State their clinical weight status clearly (e.g., "You are currently in the Overweight category").
    
    3. **Metabolic Analysis:** Explain what is happening inside *their* body at a cellular level.
       - If BMI is high (>25), explain to them how excess adipose tissue might be causing **Insulin Resistance**, **Lipid Peroxidation**, or **Chronic Inflammation**.
       - If BMI is normal, explain how their **Glycolysis** and **Lipolysis** pathways are working efficiently.
       - If BMI is low, explain **Catabolism** and the risk of muscle wasting.
       - *Crucial:* Explain this simply but accurately, as if teaching them about their own biology.
       
    4. **Biochemical Advice:** - Give 3 strict but manageable lifestyle changes to optimize their specific metabolic state (e.g., "We need to lower your cortisol spikes...").
    
    5. **The JuTeLabs Prescription (Diet):** - Suggest a specific Nigerian Breakfast, Lunch, and Dinner.
       - Focus on functional foods (e.g., "Eat Unripe Plantain for its low Glycemic Index").
    
    6. **Ethical Closing:** - Remind them that while this analysis is based on biochemistry, they should consult a physical doctor for severe symptoms.
    
    IMPORTANT OUTPUT RULES:
    1. Start the response IMMEDIATELY with the greeting: "Hello. I'm {doctor_name}..."
    2. Do NOT use introductory text like "Here is how I would address the patient."
    3. Do NOT wrap the entire response in quotation marks.
    4. Do NOT use local Nigerian greetings or slang (Standard English only).
    """
    
    try:
        response = model.generate_content(prompt)
        
        # --- 3. SAFETY CLEANER ---
        # Removes quotes and whitespace from the start/end
        cleaned_advice = response.text.strip().strip('"')
        
        # Double check to remove accidental conversational intros
        if "Here is" in cleaned_advice:
             cleaned_advice = cleaned_advice.split("\n", 1)[-1].strip()
             
        return {"bmi": bmi, "advice": cleaned_advice}
        
    except exceptions.ResourceExhausted:
        print("CRITICAL: Gemini API Quota Exceeded!")
        raise HTTPException(status_code=429, detail="AI Quota exceeded. Please wait a minute.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/convert-height")
def convert_height(data: HeightRequest):
    # 1 foot = 0.3048 meters
    # 1 inch = 0.0254 meters
    meters = (data.feet * 0.3048) + (data.inches * 0.0254)
    return {"meters": round(meters, 2)}