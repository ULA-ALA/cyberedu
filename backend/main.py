from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

from app.core.database import Base, engine
from app.core.config import settings
from app.routers import auth, users, subjects, grades, assignments, schedule, notifications, groups

Base.metadata.create_all(bind=engine)
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

app = FastAPI(
    title="UniLMS",
    description="LMS жүйесі",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(subjects.router)
app.include_router(grades.router)
app.include_router(assignments.router)
app.include_router(schedule.router)
app.include_router(notifications.router)
app.include_router(groups.router)

@app.get("/")
def root():
    return {"message": "UniLMS API жумыс истеп тур", "docs": "/docs"}

@app.on_event("startup")
def create_admin():
    from app.core.database import SessionLocal
    from app.core.security import get_password_hash
    from app.models.user import User, RoleEnum
    db = SessionLocal()
    try:
        if not db.query(User).filter(User.email == "admin@unilms.kz").first():
            admin = User(
                email="admin@unilms.kz",
                full_name="Administrator",
                hashed_password=get_password_hash("admin123"),
                role=RoleEnum.ADMIN
            )
            db.add(admin)
            db.commit()
            print("Admin jasaldy: admin@unilms.kz / admin123")
    finally:
        db.close()