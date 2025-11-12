from pydantic import BaseModel
from typing import Optional

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

    class Config:
        from_attributes = True

class InstructorCreate(BaseModel):
    name: str
    email: str
    phone: str

class InstructorResponse(BaseModel):
    id: int
    name: str
    email: str
    phone: str

    class Config:
        from_attributes = True

class BarcodeData(BaseModel):
    barcode_text: str

class ScanResponse(BaseModel):
    success: bool
    message: str
    student_data: Optional[dict] = None