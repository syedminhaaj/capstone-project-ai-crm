from fastapi import APIRouter, HTTPException, Depends, File, UploadFile
from sqlalchemy.orm import Session
from typing import List

from database import get_db
from models import Student
from schemas import StudentCreate, StudentResponse, BarcodeData, ScanResponse
from services.barcode_parser import parse_pdf417_barcode
from services.ai_scanner import scan_license_with_ai

router = APIRouter(prefix="/api/students", tags=["students"])

@router.post("", response_model=StudentResponse)
def create_student(student: StudentCreate, db: Session = Depends(get_db)):
    """Add a new student"""
    existing = db.query(Student).filter(Student.license_number == student.license_number).first()
    if existing:
        raise HTTPException(status_code=400, detail="License number already exists")
    
    db_student = Student(**student.dict(), status="Active", lessons_completed=0)
    db.add(db_student)
    db.commit()
    db.refresh(db_student)
    return db_student

@router.get("", response_model=List[StudentResponse])
def get_students(db: Session = Depends(get_db)):
    """Get all students"""
    return db.query(Student).all()

@router.get("/{student_id}", response_model=StudentResponse)
def get_student(student_id: int, db: Session = Depends(get_db)):
    """Get a specific student by ID"""
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    return student

@router.put("/{student_id}", response_model=StudentResponse)
def update_student(student_id: int, student: StudentCreate, db: Session = Depends(get_db)):
    """Update a student"""
    db_student = db.query(Student).filter(Student.id == student_id).first()
    if not db_student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    for key, value in student.dict().items():
        setattr(db_student, key, value)
    
    db.commit()
    db.refresh(db_student)
    return db_student

@router.delete("/{student_id}")
def delete_student(student_id: int, db: Session = Depends(get_db)):
    """Delete a student"""
    db_student = db.query(Student).filter(Student.id == student_id).first()
    if not db_student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    db.delete(db_student)
    db.commit()
    return {"message": "Student deleted successfully"}

@router.post("/seed-samples")
def seed_sample_students(db: Session = Depends(get_db)):
    """Add two sample students to the database"""
    existing = db.query(Student).filter(
        Student.email.in_(['sarah.johnson@example.com', 'michael.chen@example.com'])
    ).first()
    
    if existing:
        return {"message": "Sample students already exist"}
    
    students = [
        Student(
            name="Sarah Johnson",
            email="sarah.johnson@example.com",
            phone="(555) 123-4567",
            license_number="D1234567",
            date_of_birth="1998-05-15",
            address="123 Main Street, Los Angeles, CA 90001",
            emergency_contact="John Johnson",
            emergency_phone="(555) 123-4568",
            status="Active",
            lessons_completed=8
        ),
        Student(
            name="Michael Chen",
            email="michael.chen@example.com",
            phone="(555) 234-5678",
            license_number="D2345678",
            date_of_birth="2000-09-22",
            address="456 Oak Avenue, San Francisco, CA 94102",
            emergency_contact="Lisa Chen",
            emergency_phone="(555) 234-5679",
            status="Active",
            lessons_completed=15
        )
    ]
    
    for student in students:
        db.add(student)
    
    db.commit()
    return {"message": "Sample students added successfully"}

@router.post("/parse-barcode")
def parse_barcode(data: BarcodeData):
    """Parse PDF417 barcode data from driver's license"""
    return parse_pdf417_barcode(data.barcode_text)

@router.post("/scan-license", response_model=ScanResponse)
async def scan_license(file: UploadFile = File(...)):
    """Extract student information from driver's license using AI"""
    try:
        contents = await file.read()
        student_data = await scan_license_with_ai(contents)
        return ScanResponse(
            success=True,
            message="License scanned successfully",
            student_data=student_data
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))