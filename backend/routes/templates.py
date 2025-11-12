from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse

from utils.template_generator import generate_student_template

router = APIRouter(prefix="/api", tags=["templates"])

@router.get("/download-template")
def download_template():
    """Generate and download a student information template document"""
    try:
        temp_file_path = generate_student_template()
        return FileResponse(
            path=temp_file_path,
            filename='Student_Information_Template.docx',
            media_type='application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating template: {str(e)}")