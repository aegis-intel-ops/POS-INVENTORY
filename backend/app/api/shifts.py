from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from app import models
from app.database import get_db
from app.api.auth import get_current_user

router = APIRouter(prefix="/shifts", tags=["shifts"])

# Pydantic Schemas
class ShiftStart(BaseModel):
    opening_cash: float

class ShiftEnd(BaseModel):
    closing_cash: float
    notes: Optional[str] = None

class ShiftResponse(BaseModel):
    id: int
    user_id: int
    start_time: datetime
    end_time: Optional[datetime]
    opening_cash: float
    closing_cash: Optional[float]
    notes: Optional[str]
    is_active: bool
    
    class Config:
        from_attributes = True

# Endpoints
@router.post("/start", response_model=ShiftResponse)
def start_shift(
    shift: ShiftStart, 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(get_current_user)
):
    # Check if user already has an active shift
    active_shift = db.query(models.Shift).filter(
        models.Shift.user_id == current_user.id,
        models.Shift.is_active == True
    ).first()
    
    if active_shift:
        raise HTTPException(status_code=400, detail="You already have an active shift.")
    
    new_shift = models.Shift(
        user_id=current_user.id,
        opening_cash=shift.opening_cash,
        start_time=datetime.utcnow(),
        is_active=True
    )
    db.add(new_shift)
    db.commit()
    db.refresh(new_shift)
    return new_shift

@router.post("/{shift_id}/end", response_model=ShiftResponse)
def end_shift(
    shift_id: int, 
    shift_data: ShiftEnd,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    shift = db.query(models.Shift).filter(models.Shift.id == shift_id).first()
    if not shift:
        raise HTTPException(status_code=404, detail="Shift not found")
        
    if shift.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to close this shift")
        
    if not shift.is_active:
        raise HTTPException(status_code=400, detail="Shift is already closed")
    
    shift.closing_cash = shift_data.closing_cash
    shift.notes = shift_data.notes
    shift.end_time = datetime.utcnow()
    shift.is_active = False
    
    db.commit()
    db.refresh(shift)
    return shift

@router.get("/active", response_model=Optional[ShiftResponse])
def get_active_shift(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    shift = db.query(models.Shift).filter(
        models.Shift.user_id == current_user.id,
        models.Shift.is_active == True
    ).first()
    return shift

@router.get("/history", response_model=List[ShiftResponse])
def get_shift_history(
    limit: int = 20,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # Admins see all, others see own
    query = db.query(models.Shift)
    if current_user.role != "admin":
        query = query.filter(models.Shift.user_id == current_user.id)
        
    return query.order_by(models.Shift.start_time.desc()).limit(limit).all()
