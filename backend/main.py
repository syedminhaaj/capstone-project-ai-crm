from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from sqlalchemy import create_engine, Column, Integer, String, Date
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import re
import main

# ---------- Database setup ----------
DATABASE_URL = "sqlite:///./crm.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()

class Student(Base):
    __tablename__ = "students"
    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String)
    last_name = Column(String)
    license_number = Column(String, unique=True, index=True)
    dob = Column(String)
    address = Column(String)

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
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------- Models ----------
class StudentCreate(BaseModel):
    first_name: str
    last_name: str
    license_number: str
    dob: str
    address: Optional[str] = None

class InstructorCreate(BaseModel):
    name: str
    email: str
    phone: str

# ---------- Routes ----------
@app.get("/")
def root():
    return {"message": "Driving School CRM backend running!"}

@app.post("/api/students")
def add_student(student: StudentCreate):
    db = SessionLocal()
    db_student = Student(**student.dict())
    db.add(db_student)
    db.commit()
    db.refresh(db_student)
    db.close()
    return db_student

@app.get("/api/students", response_model=List[StudentCreate])
def get_students():
    db = SessionLocal()
    students = db.query(Student).all()
    db.close()
    return students

@app.post("/api/instructors")
def add_instructor(instr: InstructorCreate):
    db = SessionLocal()
    db_instructor = Instructor(**instr.dict())
    db.add(db_instructor)
    db.commit()
    db.refresh(db_instructor)
    db.close()
    return db_instructor

@app.get("/api/instructors", response_model=List[InstructorCreate])
def get_instructors():
    db = SessionLocal()
    instructors = db.query(Instructor).all()
    db.close()
    return instructors

# ---------- License Parser ----------
@app.post("/api/parse_license")
def parse_license(raw: dict):
    data = raw.get("raw", "")
    first_name = last_name = license_number = dob = address = ""
    m_name = re.search(r"DAC([A-Z\s]+)", data)
    if m_name:
        full_name = m_name.group(1).strip().split(" ")
        first_name = full_name[0]
        if len(full_name) > 1:
            last_name = " ".join(full_name[1:])
    m_lic = re.search(r"DAQ([A-Z0-9]+)", data)
    if m_lic:
        license_number = m_lic.group(1).strip()
    m_dob = re.search(r"DBB(\d{8})", data)
    if m_dob:
        dob = f"{m_dob.group(1)[:4]}-{m_dob.group(1)[4:6]}-{m_dob.group(1)[6:]}"
    m_addr = re.search(r"DAG([A-Z0-9\s]+)", data)
    if m_addr:
        address = m_addr.group(1).strip()
    return {
        "first_name": first_name,
        "last_name": last_name,
        "license_number": license_number,
        "dob": dob,
        "address": address,
    }
