import openai
import os
import base64
import json
from dotenv import load_dotenv

load_dotenv()
openai.api_key = os.getenv("OPENAI_API_KEY")

async def scan_license_with_ai(file_contents: bytes) -> dict:
    """
    Extract student information from driver's license using OpenAI GPT-4 Vision
    """
    base64_image = base64.b64encode(file_contents).decode('utf-8')
    
    response = openai.chat.completions.create(
        model="gpt-4o",
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": """Extract information from this driver's license and return as JSON:
                        {
                            "name": "full name",
                            "license_number": "license number",
                            "date_of_birth": "YYYY-MM-DD format",
                            "address": "full address"
                        }
                        Only return valid JSON, no markdown."""
                    },
                    {
                        "type": "image_url",
                        "image_url": {"url": f"data:image/jpeg;base64,{base64_image}"}
                    }
                ]
            }
        ],
        max_tokens=500
    )
    
    ai_response = response.choices[0].message.content.strip()
    
    # Remove markdown code blocks if present
    if ai_response.startswith("```"):
        ai_response = ai_response.split("```")[1]
        if ai_response.startswith("json"):
            ai_response = ai_response[4:]
        ai_response = ai_response.strip()
    
    return json.loads(ai_response)