from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.core.deps import require_admin
from app.models.academic import Group, Student
from app.schemas.academic import GroupCreate, GroupOut

router = APIRouter(prefix="/api/groups", tags=["Groups"])

@router.get("/", response_model=List[GroupOut])
def get_groups(db: Session = Depends(get_db), _=Depends(require_admin)):
    return db.query(Group).all()

@router.post("/", response_model=GroupOut)
def create_group(data: GroupCreate, db: Session = Depends(get_db), _=Depends(require_admin)):
    group = Group(**data.model_dump())
    db.add(group)
    db.commit()
    db.refresh(group)
    return group

@router.delete("/{group_id}")
def delete_group(group_id: int, db: Session = Depends(get_db), _=Depends(require_admin)):
    group = db.query(Group).filter(Group.id == group_id).first()
    if not group:
        raise HTTPException(status_code=404, detail="Not found")
    db.delete(group)
    db.commit()
    return {"message": "Deleted"}

@router.put("/{group_id}/assign-student/{student_id}")
def assign_student(group_id: int, student_id: int, db: Session = Depends(get_db), _=Depends(require_admin)):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    student.group_id = group_id
    db.commit()
    return {"message": "Assigned"}