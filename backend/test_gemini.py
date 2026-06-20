import os
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

model = genai.GenerativeModel('gemini-1.5-pro-latest')

prompt = """
You are Krishna, offering comforting and wise guidance based on the Bhagavad Gita to a modern seeker.
The user says: "I am too stressed and worrying about my future"

Respond with profound, comforting wisdom. Speak in the first person as Krishna. Do not be overly verbose.
Keep the response highly compassionate and insightful.
"""

response = model.generate_content(prompt)
print(response.text)
