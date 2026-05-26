from fastapi import FastAPI, UploadFile, File,Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import fitz
from openai import OpenAI
import os
from dotenv import load_dotenv


load_dotenv()

client=OpenAI(api_key=os.getenv("GROQ_API_KEY"),base_url="https://api.groq.com/openai/v1")

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

class ChatRequest(BaseModel):
    message:str

# Home Route
@app.get("/")
def home():
    return {"message": "AI Career Assistant Backend Running"}

#Test Route
@app.get("/test")
def test():
    return{
        "message":"Backend Working"
    }

#Test GROQ
@app.get("/test-groq")
def test_groq():
    try:
        response=client.chat.completions.create(
            model="llama-3.1-8b-instant",

            messages=[
                {
                    "role":"user",
                    "content":"Say hello"
                }
            ]
        )
        return{
            "response":response.choices[0].message.content
        }
    except Exception as e:
        return{
            "error":str(e)
    }

#Chatbot Route
@app.post("/chat")
async def chat(request:ChatRequest):
    try:
        user_message=request.message

        response=client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {
                    "role":"system",
                    "content":"""
                    You are a friendly AI Career Assistant chatbot.

                    Your behavior should feel conversational like ChatGPT.

                    you ONLY answer question related to:
                    - Career Advice
                    - Resume Analysis
                    -jobs
                    - Interview Preparation
                    - Skills 
                    - Learning Roadmaps
                    - Job Search Strategies
                    - Programmming Help
                    - Technical Concepts Explanation
                    - higher Studies
                    -Internships
                    - Certifications.
        
                    Rules:
                    - First understand the user's goal
                    - Ask follow-up questions before giving long answers
                    - Guide users step-by-step
                    - Be interactive and supportive
                    - Keep responses natural and conversational
                    - Do not give huge responses immediately
                    - Ask clarifying questions when needed

                    Examples:

                    If user says:
                    "I want to become an ML Engineer"

                    Ask:    
                    - current skills
                    - experience level
                    - timeline
                    - interests

                    If user says:
                    "Analyze my resume"

                    Ask them to upload their resume.

                    If user says:  
                    " I want interview preparation"

                    Ask:
                    - company type 
                    - role
                    - experience level

                    You are a career mentor, not just an answer generator.
                    If the user asks something unrelated to career or education,politely reply:
                    "I'm designed specifically for career advice or education guidance.Please ask something
                    related to careers,skills,jobs,interviews or learning!"

                    Keep the conversation engaging and helpful.
                    """
                },
                {
                    "role":"user",
                    "content":user_message
                }
            ],
            temperature=0.7
        )
        reply=response.choices[0].message.content
        
        return{
            "reply":reply
        }
    except Exception as e:
        return{
            "error":str(e)
    }

#Resume Analysis Route

@app.post("/analyze-resume/")
async def analyze_resume(
    file:UploadFile=File(...),
    role:str=Form(...),
    job_description:str=Form(...),
):
    try:
        print("API CALLED")

        file_path=os.path.join(UPLOAD_FOLDER,file.filename)

        contents=await file.read()

        with open(file_path,"wb")as f:
            f.write(contents)

        doc=fitz.open(file_path)

        text=""

        for page in doc:
            text+=page.get_text()
        print("PDF TEXT EXTRACTED")


        # OpenAI Response
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",

            messages=[
                {
                    "role": "system",
                    "content": """You are an expert career advisor and ATS resume analyzer."""
                },
                {
                    "role": "user",
                    "content": f"""
                    Analyze this resume for the role:{role}

                    Job Description:{job_description}

                    Resume:{text}

                    Give:
                    1. ATS Match Score
                    2. Strengths
                    3. Weaknesses
                    4. Missing Skills
                    5. Career Suggestions
                    6.Resume Improvements
                    7.Interview Preparation Tips

                    Resume:
                    {text}
                    """
                }
            ],
            temperature=0.7
        )

        analysis = response.choices[0].message.content

        print("AI RESPONSE GENERATED")

        return {
            "analysis": analysis
        }

    except Exception as e:
        print("ERROR:",str(e))
        return {
            "error": str(e)
        }
