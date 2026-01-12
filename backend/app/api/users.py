from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from typing import List, Optional
from app import models
from app.database import get_db
from app.api.auth import get_current_user, get_password_hash

router = APIRouter(prefix="/users", tags=["users"])

# Schemas
class UserCreate(BaseModel):
    username: str
    email: Optional[str] = None
    password: str
    role: str = "cashier"  # admin, cashier, kitchen

class UserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[str] = None
    password: Optional[str] = None
    role: Optional[str] = None
    is_active: Optional[bool] = None

class UserResponse(BaseModel):
    id: int
    username: str
    email: Optional[str]
    role: str
    is_active: bool
    
    class Config:
        from_attributes = True

# Helper to check admin
def check_admin(user: models.User):
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized. Admin access required.")

@router.get("/", response_model=List[UserResponse])
def get_users(
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(get_current_user)
):
    check_admin(current_user)
    return db.query(models.User).all()

@router.post("/", response_model=UserResponse)
def create_user(
    user: UserCreate, 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(get_current_user)
):
    check_admin(current_user)
    
    # Check existing
    existing = db.query(models.User).filter(models.User.username == user.username).first()
    if existing:
        raise HTTPException(status_code=400, detail="Username already registered")
        
    hashed_password = get_password_hash(user.password)
    
    new_user = models.User(
        username=user.username,
        email=user.email,
        hashed_password=hashed_password,
        role=user.role,
        is_active=True
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.delete("/{user_id}")
def delete_user(
    user_id: int, 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(get_current_user)
):
    check_admin(current_user)
    
    user_to_delete = db.query(models.User).filter(models.User.id == user_id).first()
    if not user_to_delete:
        raise HTTPException(status_code=404, detail="User not found")
        
    if user_to_delete.id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot delete yourself")
    
    db.delete(user_to_delete)
    db.commit()
    return {"message": "User deleted"}
