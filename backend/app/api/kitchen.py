from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
from app import models
from app.database import get_db
from app.api.auth import get_current_user

router = APIRouter(prefix="/kitchen", tags=["kitchen"])

# Response Schema
class KitchenOrderStart(BaseModel):
    id: str  # UUID
    status: str
    kitchen_status: str
    items_json: List[dict]
    created_at: datetime
    # We might want customer name or table number if available
    
    class Config:
        from_attributes = True

class StatusUpdate(BaseModel):
    status: str # pending, preparing, ready, served

@router.get("/orders", response_model=List[KitchenOrderStart])
def get_kitchen_orders(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # Fetch orders that are NOT served
    orders = db.query(models.Order).filter(
        models.Order.kitchen_status.in_(["pending", "preparing", "ready"])
    ).order_by(models.Order.created_at.asc()).all()
    
    return orders

@router.post("/orders/{order_id}/status")
def update_kitchen_status(
    order_id: str,
    status_update: StatusUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
        
    # Validate status transition? For MVP, just allow update
    valid_statuses = ["pending", "preparing", "ready", "served"]
    if status_update.status not in valid_statuses:
        raise HTTPException(status_code=400, detail="Invalid status")
        
    order.kitchen_status = status_update.status
    db.commit()
    
    return {"message": "Status updated", "new_status": order.kitchen_status}
