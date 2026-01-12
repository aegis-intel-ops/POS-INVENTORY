from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional, Any
from datetime import datetime
from sqlalchemy.orm import Session
from app import models
from app.database import get_db
import json

router = APIRouter()

class OrderItemSchema(BaseModel):
    product_id: int
    name: str
    price: float
    quantity: int
    tax_amount: float

class OrderSchema(BaseModel):
    id: str  # UUID
    items: List[dict] # Keeping as dict for simplicity, or use OrderItemSchema
    total_amount: float
    total_tax: float
    status: str
    payment_method: str
    created_at: datetime
    synced: Optional[bool] = True

@router.post("/sync/orders")
async def sync_orders(orders: List[OrderSchema], db: Session = Depends(get_db)):
    synced_count = 0
    for order_data in orders:
        # Check if order exists
        existing_order = db.query(models.Order).filter(models.Order.id == order_data.id).first()
        if existing_order:
            continue # Skip or update? Skip for now implies idempotency

        new_order = models.Order(
            id=order_data.id,
            total_amount=order_data.total_amount,
            total_tax=order_data.total_tax,
            status=order_data.status,
            payment_method=order_data.payment_method,
            created_at=order_data.created_at,
            items_json=order_data.items # Storing raw JSON as per model definition
        )
        db.add(new_order)
        synced_count += 1
    
    try:
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

    return {"status": "success", "synced_count": synced_count}

@router.get("/sync/products")
async def get_products(db: Session = Depends(get_db)):
    products = db.query(models.Product).all()
    
    # If no products in DB, return some defaults for testing/setup
    if not products:
        return [
            {"id": 1, "name": "Jollof Rice", "price": 45.00, "category": "Main", "tax_group": "VAT_standard"},
            {"id": 2, "name": "Fried Rice", "price": 40.00, "category": "Main", "tax_group": "VAT_standard"},
             {"id": 3, "name": "Grilled Tilapia", "price": 75.00, "category": "Main", "tax_group": "VAT_standard"},
             {"id": 4, "name": "Kelewele", "price": 20.00, "category": "Side", "tax_group": "VAT_standard"}
        ]
        
    return products
