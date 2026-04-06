from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.core.deps import get_current_user, require_teacher
from app.models.academic import Grade, Student
from app.models.user import User, RoleEnum
from app.schemas.academic import GradeCreate, GradeOut

router = APIRouter(prefix="/api/grades", tags=["Grades"])

@router.get("/", response_model=List[GradeOut])
def get_grades(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role == RoleEnum.STUDENT:
        student = db.query(Student).filter(Student.user_id == current_user.id).first()
        if not student:
            return []
        return db.query(Grade).filter(Grade.student_id == student.id).all()
    return db.query(Grade).all()

@router.post("/", response_model=GradeOut)
def create_grade(data: GradeCreate, db: Session = Depends(get_db), _=Depends(require_teacher)):
    grade = Grade(**data.model_dump())
    db.add(grade)
    db.commit()
    db.refresh(grade)
    return grade

@router.put("/{grade_id}", response_model=GradeOut)
def update_grade(grade_id: int, data: GradeCreate, db: Session = Depends(get_db), _=Depends(require_teacher)):
    grade = db.query(Grade).filter(Grade.id == grade_id).first()
    if not grade:
        raise HTTPException(status_code=404, detail="Not found")
    for k, v in data.model_dump().items():
        setattr(grade, k, v)
    db.commit()
    db.refresh(grade)
    return grade

@router.delete("/{grade_id}")
def delete_grade(grade_id: int, db: Session = Depends(get_db), _=Depends(require_teacher)):
    grade = db.query(Grade).filter(Grade.id == grade_id).first()
    if not grade:
        raise HTTPException(status_code=404, detail="Not found")
    db.delete(grade)
    db.commit()
    return {"message": "Deleted"}