from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.core.deps import get_current_user, require_admin
from app.models.academic import Subject, Enrollment
from app.models.user import User
from app.schemas.academic import SubjectCreate, SubjectOut, EnrollmentCreate

router = APIRouter(prefix="/api/subjects", tags=["Subjects"])

@router.get("/", response_model=List[SubjectOut])
def get_subjects(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Subject).all()

@router.post("/", response_model=SubjectOut)
def create_subject(data: SubjectCreate, db: Session = Depends(get_db), _=Depends(require_admin)):
    if db.query(Subject).filter(Subject.code == data.code).first():
        raise HTTPException(status_code=400, detail="Subject code already exists")
    subject = Subject(**data.model_dump())
    db.add(subject)
    db.commit()
    db.refresh(subject)
    return subject

@router.put("/{subject_id}", response_model=SubjectOut)
def update_subject(subject_id: int, data: SubjectCreate, db: Session = Depends(get_db), _=Depends(require_admin)):
    subject = db.query(Subject).filter(Subject.id == subject_id).first()
    if not subject:
        raise HTTPException(status_code=404, detail="Not found")
    for k, v in data.model_dump().items():
        setattr(subject, k, v)
    db.commit()
    db.refresh(subject)
    return subject

@router.delete("/{subject_id}")
def delete_subject(subject_id: int, db: Session = Depends(get_db), _=Depends(require_admin)):
    subject = db.query(Subject).filter(Subject.id == subject_id).first()
    if not subject:
        raise HTTPException(status_code=404, detail="Not found")
    db.delete(subject)
    db.commit()
    return {"message": "Deleted"}

@router.post("/enroll")
def enroll(data: EnrollmentCreate, db: Session = Depends(get_db), _=Depends(require_admin)):
    enrollment = Enrollment(**data.model_dump())
    db.add(enrollment)
    db.commit()
    return {"message": "Enrolled"}