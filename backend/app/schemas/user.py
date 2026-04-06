from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from app.models.user import RoleEnum

class UserCreate(BaseModel):
    email: EmailStr
    full_name: str
    password: str
    role: RoleEnum

class UserOut(BaseModel):
    id: int
    email: str
    full_name: str
    role: RoleEnum
    is_active: bool
    created_at: datetime
    class Config:
        from_attributes = True

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    is_active: Optional[bool] = None

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

class RefreshRequest(BaseModel):
    refresh_token: str