import os, shutil
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from app.core.database import get_db
from app.core.deps import get_current_user, require_teacher
from app.core.config import settings
from app.models.academic import Assignment, Submission, Student
from app.models.user import User, RoleEnum
from app.schemas.academic import AssignmentOut, SubmissionOut

router = APIRouter(prefix="/api/assignments", tags=["Assignments"])

@router.get("/", response_model=List[AssignmentOut])
def get_assignments(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Assignment).all()

@router.post("/", response_model=AssignmentOut)
async def create_assignment(
    title: str = Form(...),
    description: Optional[str] = Form(None),
    subject_id: int = Form(...),
    deadline: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    _=Depends(require_teacher)
):
    file_path = None
    if file:
        os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
        file_path = f"{settings.UPLOAD_DIR}/{file.filename}"
        with open(file_path, "wb") as f:
            shutil.copyfileobj(file.file, f)
    assignment = Assignment(
        title=title,
        description=description,
        subject_id=subject_id,
        deadline=datetime.fromisoformat(deadline) if deadline else None,
        file_path=file_path
    )
    db.add(assignment)
    db.commit()
    db.refresh(assignment)
    return assignment

@router.post("/{assignment_id}/submit", response_model=SubmissionOut)
async def submit_assignment(
    assignment_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != RoleEnum.STUDENT:
        raise HTTPException(status_code=403, detail="Students only")
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    file_path = f"{settings.UPLOAD_DIR}/sub_{student.id}_{assignment_id}_{file.filename}"
    with open(file_path, "wb") as f:
        shutil.copyfileobj(file.file, f)
    submission = Submission(
        assignment_id=assignment_id,
        student_id=student.id,
        file_path=file_path
    )
    db.add(submission)
    db.commit()
    db.refresh(submission)
    return submission

@router.get("/submissions", response_model=List[SubmissionOut])
def get_submissions(db: Session = Depends(get_db), _=Depends(require_teacher)):
    return db.query(Submission).all()

@router.put("/submissions/{sub_id}")
def grade_submission(
    sub_id: int,
    score: float,
    comment: Optional[str] = None,
    db: Session = Depends(get_db),
    _=Depends(require_teacher)
):
    sub = db.query(Submission).filter(Submission.id == sub_id).first()
    if not sub:
        raise HTTPException(status_code=404, detail="Not found")
    sub.score = score
    sub.comment = comment
    sub.status = "graded"
    db.commit()
    return {"message": "Graded"}