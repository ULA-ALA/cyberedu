from sqlalchemy import Column, Integer, String, Float, Text, DateTime, ForeignKey, Boolean, Time
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class Group(Base):
    __tablename__ = "groups"
    id       = Column(Integer, primary_key=True, index=True)
    name     = Column(String, nullable=False, unique=True)
    year     = Column(Integer)
    students  = relationship("Student", back_populates="group")
    schedules = relationship("Schedule", back_populates="group")

class Student(Base):
    __tablename__ = "students"
    id         = Column(Integer, primary_key=True, index=True)
    user_id    = Column(Integer, ForeignKey("users.id"), unique=True)
    group_id   = Column(Integer, ForeignKey("groups.id"), nullable=True)
    student_id = Column(String, unique=True)
    user        = relationship("User", back_populates="student")
    group       = relationship("Group", back_populates="students")
    grades      = relationship("Grade", back_populates="student")
    submissions = relationship("Submission", back_populates="student")
    enrollments = relationship("Enrollment", back_populates="student")

class Teacher(Base):
    __tablename__ = "teachers"
    id         = Column(Integer, primary_key=True, index=True)
    user_id    = Column(Integer, ForeignKey("users.id"), unique=True)
    department = Column(String)
    user      = relationship("User", back_populates="teacher")
    subjects  = relationship("Subject", back_populates="teacher")
    schedules = relationship("Schedule", back_populates="teacher")

class Subject(Base):
    __tablename__ = "subjects"
    id         = Column(Integer, primary_key=True, index=True)
    name       = Column(String, nullable=False)
    code       = Column(String, unique=True)
    credits    = Column(Integer, default=3)
    teacher_id = Column(Integer, ForeignKey("teachers.id"), nullable=True)
    teacher     = relationship("Teacher", back_populates="subjects")
    grades      = relationship("Grade", back_populates="subject")
    assignments = relationship("Assignment", back_populates="subject")
    enrollments = relationship("Enrollment", back_populates="subject")
    schedules   = relationship("Schedule", back_populates="subject")

class Enrollment(Base):
    __tablename__ = "enrollments"
    id         = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"))
    subject_id = Column(Integer, ForeignKey("subjects.id"))
    student = relationship("Student", back_populates="enrollments")
    subject = relationship("Subject", back_populates="enrollments")

class Grade(Base):
    __tablename__ = "grades"
    id         = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"))
    subject_id = Column(Integer, ForeignKey("subjects.id"))
    score      = Column(Float)
    comment    = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    student = relationship("Student", back_populates="grades")
    subject = relationship("Subject", back_populates="grades")

class Assignment(Base):
    __tablename__ = "assignments"
    id          = Column(Integer, primary_key=True, index=True)
    title       = Column(String, nullable=False)
    description = Column(Text)
    subject_id  = Column(Integer, ForeignKey("subjects.id"))
    deadline    = Column(DateTime(timezone=True))
    file_path   = Column(String, nullable=True)
    created_at  = Column(DateTime(timezone=True), server_default=func.now())
    subject     = relationship("Subject", back_populates="assignments")
    submissions = relationship("Submission", back_populates="assignment")

class Submission(Base):
    __tablename__ = "submissions"
    id            = Column(Integer, primary_key=True, index=True)
    assignment_id = Column(Integer, ForeignKey("assignments.id"))
    student_id    = Column(Integer, ForeignKey("students.id"))
    file_path     = Column(String)
    status        = Column(String, default="submitted")
    score         = Column(Float, nullable=True)
    comment       = Column(Text, nullable=True)
    submitted_at  = Column(DateTime(timezone=True), server_default=func.now())
    assignment = relationship("Assignment", back_populates="submissions")
    student    = relationship("Student", back_populates="submissions")

class Schedule(Base):
    __tablename__ = "schedule"
    id          = Column(Integer, primary_key=True, index=True)
    subject_id  = Column(Integer, ForeignKey("subjects.id"))
    teacher_id  = Column(Integer, ForeignKey("teachers.id"))
    group_id    = Column(Integer, ForeignKey("groups.id"))
    day_of_week = Column(String)
    start_time  = Column(Time)
    end_time    = Column(Time)
    room        = Column(String)
    subject = relationship("Subject", back_populates="schedules")
    teacher = relationship("Teacher", back_populates="schedules")
    group   = relationship("Group", back_populates="schedules")

class Notification(Base):
    __tablename__ = "notifications"
    id         = Column(Integer, primary_key=True, index=True)
    user_id    = Column(Integer, ForeignKey("users.id"))
    title      = Column(String)
    message    = Column(Text)
    is_read    = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    user = relationship("User", back_populates="notifications")