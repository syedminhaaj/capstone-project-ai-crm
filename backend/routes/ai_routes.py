from flask import Blueprint, request, jsonify
import re, base64, json, os
import openai
from dotenv import load_dotenv

load_dotenv()
openai.api_key = os.getenv("OPENAI_API_KEY")

ai_bp = Blueprint('ai_bp', __name__)

@ai_bp.route('/parse-barcode', methods=['POST'])
def parse_barcode():
    data = request.json
    raw = data.get("barcode_text", "")
    result = {
        "name": "",
        "license_number": "",
        "date_of_birth": "",
        "address": ""
    }

    first = re.search(r"DCT([A-Z\s]+)", raw)
    last = re.search(r"DCS([A-Z\s]+)", raw)
    lic = re.search(r"DAQ([A-Z0-9]+)", raw)
    dob = re.search(r"DBB(\d{8})", raw)
    addr = re.search(r"DAG([A-Z0-9\s]+)", raw)
    city = re.search(r"DAI([A-Z\s]+)", raw)
    state = re.search(r"DAJ([A-Z]{2})", raw)
    zipc = re.search(r"DAK(\d{5,9})", raw)

    if first and last:
        result["name"] = f"{first.group(1).strip()} {last.group(1).strip()}"
    if lic:
        result["license_number"] = lic.group(1).strip()
    if dob:
        result["date_of_birth"] = f"{dob.group(1)[4:]}-{dob.group(1)[:2]}-{dob.group(1)[2:4]}"
    if addr:
        address = [addr.group(1).strip()]
        if city: address.append(city.group(1).strip())
        if state: address.append(state.group(1).strip())
        if zipc: address.append(zipc.group(1).strip()[:5])
        result["address"] = ", ".join(address)

    return jsonify(result)

@ai_bp.route('/scan-license', methods=['POST'])
def scan_license():
    try:
        file = request.files['file']
        contents = file.read()
        base64_image = base64.b64encode(contents).decode('utf-8')

        response = openai.chat.completions.create(
            model="gpt-4o",
            messages=[{
                "role": "user",
                "content": [
                    {"type": "text", "text": """Extract driver's license details as JSON:
                    {"name": "", "license_number": "", "date_of_birth": "", "address": ""}"""},
                    {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{base64_image}"}}
                ]
            }]
        )

        text = response.choices[0].message.content.strip()
        if text.startswith("```"):
            text = text.split("```")[1].replace("json", "").strip()
        student_data = json.loads(text)
        return jsonify({"success": True, "student_data": student_data})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
