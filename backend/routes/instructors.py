from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from database import get_db
from models import Instructor
from schemas import InstructorCreate, InstructorResponse

router = APIRouter(prefix="/api/instructors", tags=["instructors"])

@router.post("", response_model=InstructorResponse)
def create_instructor(instructor: InstructorCreate, db: Session = Depends(get_db)):
    """Add a new instructor"""
    db_instructor = Instructor(**instructor.dict())
    db.add(db_instructor)
    db.commit()
    db.refresh(db_instructor)
    return db_instructor

@router.get("", response_model=List[InstructorResponse])
def get_instructors(db: Session = Depends(get_db)):
    """Get all instructors"""
    return db.query(Instructor).all()