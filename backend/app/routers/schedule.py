from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.core.deps import get_current_user, require_admin
from app.models.academic import Schedule, Student, Teacher
from app.models.user import User, RoleEnum
from app.schemas.academic import ScheduleCreate, ScheduleOut

router = APIRouter(prefix="/api/schedule", tags=["Schedule"])

@router.get("/", response_model=List[ScheduleOut])
def get_schedule(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role == RoleEnum.STUDENT:
        student = db.query(Student).filter(Student.user_id == current_user.id).first()
        if not student or not student.group_id:
            return []
        return db.query(Schedule).filter(Schedule.group_id == student.group_id).all()
    elif current_user.role == RoleEnum.TEACHER:
        teacher = db.query(Teacher).filter(Teacher.user_id == current_user.id).first()
        if not teacher:
            return []
        return db.query(Schedule).filter(Schedule.teacher_id == teacher.id).all()
    return db.query(Schedule).all()

@router.post("/", response_model=ScheduleOut)
def create_schedule(data: ScheduleCreate, db: Session = Depends(get_db), _=Depends(require_admin)):
    schedule = Schedule(**data.model_dump())
    db.add(schedule)
    db.commit()
    db.refresh(schedule)
    return schedule

@router.delete("/{schedule_id}")
def delete_schedule(schedule_id: int, db: Session = Depends(get_db), _=Depends(require_admin)):
    s = db.query(Schedule).filter(Schedule.id == schedule_id).first()
    if not s:
        raise HTTPException(status_code=404, detail="Not found")
    db.delete(s)
    db.commit()
    return {"message": "Deleted"}