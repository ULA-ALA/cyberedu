from pydantic import BaseModel
from typing import Optional
from datetime import datetime, time

class GroupCreate(BaseModel):
    name: str
    year: Optional[int] = None

class GroupOut(BaseModel):
    id: int
    name: str
    year: Optional[int]
    class Config:
        from_attributes = True

class SubjectCreate(BaseModel):
    name: str
    code: str
    credits: Optional[int] = 3
    teacher_id: Optional[int] = None

class SubjectOut(BaseModel):
    id: int
    name: str
    code: str
    credits: int
    teacher_id: Optional[int]
    class Config:
        from_attributes = True

class GradeCreate(BaseModel):
    student_id: int
    subject_id: int
    score: float
    comment: Optional[str] = None

class GradeOut(BaseModel):
    id: int
    student_id: int
    subject_id: int
    score: float
    comment: Optional[str]
    created_at: datetime
    class Config:
        from_attributes = True

class AssignmentCreate(BaseModel):
    title: str
    description: Optional[str] = None
    subject_id: int
    deadline: Optional[datetime] = None

class AssignmentOut(BaseModel):
    id: int
    title: str
    description: Optional[str]
    subject_id: int
    deadline: Optional[datetime]
    file_path: Optional[str]
    created_at: datetime
    class Config:
        from_attributes = True

class SubmissionOut(BaseModel):
    id: int
    assignment_id: int
    student_id: int
    file_path: str
    status: str
    score: Optional[float]
    comment: Optional[str]
    submitted_at: datetime
    class Config:
        from_attributes = True

class ScheduleCreate(BaseModel):
    subject_id: int
    teacher_id: int
    group_id: int
    day_of_week: str
    start_time: time
    end_time: time
    room: str

class ScheduleOut(BaseModel):
    id: int
    subject_id: int
    teacher_id: int
    group_id: int
    day_of_week: str
    start_time: time
    end_time: time
    room: str
    class Config:
        from_attributes = True

class NotificationOut(BaseModel):
    id: int
    title: str
    message: str
    is_read: bool
    created_at: datetime
    class Config:
        from_attributes = True

class EnrollmentCreate(BaseModel):
    student_id: int
    subject_id: int