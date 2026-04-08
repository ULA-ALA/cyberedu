from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.core.deps import get_current_user, require_teacher
from app.models.academic import Assignment, Submission, Student
from app.models.user import User, RoleEnum
from app.schemas.academic import AssignmentOut
import os, shutil

router = APIRouter(prefix="/api/assignments", tags=["Assignments"])

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.get("", response_model=List[AssignmentOut])
def get_assignments(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Assignment).all()

@router.post("", response_model=AssignmentOut)
async def create_assignment(
    title: str = Form(...),
    description: str = Form(""),
    subject_id: int = Form(...),
    deadline: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    _=Depends(require_teacher)
):
    file_path = None
    if file:
        file_path = f"{UPLOAD_DIR}/{file.filename}"
        with open(file_path, "wb") as f:
            shutil.copyfileobj(file.file, f)

    assignment = Assignment(
        title=title,
        description=description,
        subject_id=subject_id,
        deadline=deadline,
        file_path=file_path
    )
    db.add(assignment)
    db.commit()
    db.refresh(assignment)
    return assignment

@router.post("/{assignment_id}/submit")
async def submit_assignment(
    assignment_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    file_path = f"{UPLOAD_DIR}/{file.filename}"
    with open(file_path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    submission = Submission(
        assignment_id=assignment_id,
        student_id=student.id,
        file_path=file_path
    )
    db.add(submission)
    db.commit()
    return {"message": "Submitted"}

@router.delete("/{assignment_id}")
def delete_assignment(assignment_id: int, db: Session = Depends(get_db), _=Depends(require_teacher)):
    a = db.query(Assignment).filter(Assignment.id == assignment_id).first()
    if not a:
        raise HTTPException(status_code=404, detail="Not found")
    db.delete(a)
    db.commit()
    return {"message": "Deleted"}