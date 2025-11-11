from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import re
import openai
import os
from dotenv import load_dotenv
import base64
import json

load_dotenv()

# ---------- Database setup ----------
DATABASE_URL = "sqlite:///./crm.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()

class Student(Base):
    __tablename__ = "students"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    email = Column(String)
    phone = Column(String)
    license_number = Column(String, unique=True, index=True)
    date_of_birth = Column(String)
    address = Column(String)
    emergency_contact = Column(String)
    emergency_phone = Column(String)
    status = Column(String, default="Active")
    lessons_completed = Column(Integer, default=0)

class Instructor(Base):
    __tablename__ = "instructors"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    email = Column(String)
    phone = Column(String)

Base.metadata.create_all(bind=engine)

# ---------- FastAPI app ----------
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

openai.api_key = os.getenv("OPENAI_API_KEY")

# ---------- Models ----------
class StudentCreate(BaseModel):
    name: str
    email: str
    phone: str
    license_number: str
    date_of_birth: str
    address: str
    emergency_contact: str
    emergency_phone: str

class StudentResponse(BaseModel):
    id: int
    name: str
    email: str
    phone: str
    license_number: str
    date_of_birth: str
    address: str
    emergency_contact: str
    emergency_phone: str
    status: str
    lessons_completed: int

class BarcodeData(BaseModel):
    barcode_text: str

# ---------- Routes ----------
@app.get("/")
def root():
    return {"message": "Driving School CRM backend running!"}

# ---------- Student CRUD ----------
@app.post("/api/students", response_model=StudentResponse)
def add_student(student: StudentCreate):
    db = SessionLocal()
    try:
        existing = db.query(Student).filter(Student.license_number == student.license_number).first()
        if existing:
            raise HTTPException(status_code=400, detail="License number already exists")
        
        db_student = Student(**student.dict(), status="Active", lessons_completed=0)
        db.add(db_student)
        db.commit()
        db.refresh(db_student)
        return db_student
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()

@app.get("/api/students", response_model=List[StudentResponse])
def get_students():
    db = SessionLocal()
    try:
        students = db.query(Student).all()
        return students
    finally:
        db.close()

@app.get("/api/students/{student_id}", response_model=StudentResponse)
def get_student(student_id: int):
    db = SessionLocal()
    try:
        student = db.query(Student).filter(Student.id == student_id).first()
        if not student:
            raise HTTPException(status_code=404, detail="Student not found")
        return student
    finally:
        db.close()

@app.put("/api/students/{student_id}", response_model=StudentResponse)
def update_student(student_id: int, student: StudentCreate):
    db = SessionLocal()
    try:
        db_student = db.query(Student).filter(Student.id == student_id).first()
        if not db_student:
            raise HTTPException(status_code=404, detail="Student not found")
        
        for key, value in student.dict().items():
            setattr(db_student, key, value)
        
        db.commit()
        db.refresh(db_student)
        return db_student
    finally:
        db.close()

@app.delete("/api/students/{student_id}")
def delete_student(student_id: int):
    db = SessionLocal()
    try:
        db_student = db.query(Student).filter(Student.id == student_id).first()
        if not db_student:
            raise HTTPException(status_code=404, detail="Student not found")
        
        db.delete(db_student)
        db.commit()
        return {"message": "Student deleted successfully"}
    finally:
        db.close()

# ---------- PDF417 Barcode Parser ----------
@app.post("/api/parse-barcode")
def parse_barcode(data: BarcodeData):
    """
    Parse PDF417 barcode data from driver's license
    Standard AAMVA format
    """
    raw = data.barcode_text
    result = {
        "name": "",
        "license_number": "",
        "date_of_birth": "",
        "address": "",
    }
    
    # Extract First Name (DCT or DAC)
    first_name = ""
    last_name = ""
    middle_name = ""
    
    m_first = re.search(r"DCT([A-Z\s]+?)(?=\n|D[A-Z]{2})", raw, re.MULTILINE)
    if m_first:
        first_name = m_first.group(1).strip()
    
    # Extract Last Name (DCS)
    m_last = re.search(r"DCS([A-Z\s]+?)(?=\n|D[A-Z]{2})", raw, re.MULTILINE)
    if m_last:
        last_name = m_last.group(1).strip()
    
    # Extract Middle Name (DAD)
    m_middle = re.search(r"DAD([A-Z\s]+?)(?=\n|D[A-Z]{2})", raw, re.MULTILINE)
    if m_middle:
        middle_name = m_middle.group(1).strip()
    
    # Combine name
    if first_name and last_name:
        result["name"] = f"{first_name} {middle_name} {last_name}".strip() if middle_name else f"{first_name} {last_name}"
    
    # Extract License Number (DAQ)
    m_lic = re.search(r"DAQ([A-Z0-9]+?)(?=\n|D[A-Z]{2})", raw, re.MULTILINE)
    if m_lic:
        result["license_number"] = m_lic.group(1).strip()
    
    # Extract DOB (DBB format: MMDDYYYY or YYYYMMDD)
    m_dob = re.search(r"DBB(\d{8})", raw)
    if m_dob:
        dob_str = m_dob.group(1)
        # Try YYYYMMDD format first
        if dob_str[:4].isdigit() and int(dob_str[:4]) > 1900:
            result["date_of_birth"] = f"{dob_str[:4]}-{dob_str[4:6]}-{dob_str[6:]}"
        else:
            # MMDDYYYY format
            result["date_of_birth"] = f"{dob_str[4:]}-{dob_str[:2]}-{dob_str[2:4]}"
    
    # Extract Address Components
    street = city = state = zip_code = ""
    
    # Street Address (DAG)
    m_street = re.search(r"DAG([A-Z0-9\s]+?)(?=\n|D[A-Z]{2})", raw, re.MULTILINE)
    if m_street:
        street = m_street.group(1).strip()
    
    # City (DAI)
    m_city = re.search(r"DAI([A-Z\s]+?)(?=\n|D[A-Z]{2})", raw, re.MULTILINE)
    if m_city:
        city = m_city.group(1).strip()
    
    # State (DAJ)
    m_state = re.search(r"DAJ([A-Z]{2})", raw)
    if m_state:
        state = m_state.group(1).strip()
    
    # ZIP (DAK)
    m_zip = re.search(r"DAK(\d{5,9})", raw)
    if m_zip:
        zip_code = m_zip.group(1).strip()[:5]  # Take first 5 digits
    
    # Combine address
    address_parts = [p for p in [street, city, state, zip_code] if p]
    if address_parts:
        result["address"] = ", ".join(address_parts)
    
    return result

# ---------- AI Image Scanning ----------
@app.post("/api/scan-license")
async def scan_license(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        base64_image = base64.b64encode(contents).decode('utf-8')
        
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
        if ai_response.startswith("```"):
            ai_response = ai_response.split("```")[1]
            if ai_response.startswith("json"):
                ai_response = ai_response[4:]
            ai_response = ai_response.strip()
        
        student_data = json.loads(ai_response)
        return {"success": True, "message": "License scanned", "student_data": student_data}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ---------- Instructors ----------
@app.post("/api/instructors")
def add_instructor(instr):
    db = SessionLocal()
    try:
        db_instructor = Instructor(**instr.dict())
        db.add(db_instructor)
        db.commit()
        db.refresh(db_instructor)
        return db_instructor
    finally:
        db.close()

@app.get("/api/instructors")
def get_instructors():
    db = SessionLocal()
    try:
        return db.query(Instructor).all()
    finally:
        db.close()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)