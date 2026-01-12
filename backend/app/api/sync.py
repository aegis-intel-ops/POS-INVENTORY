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
        
        # Process Inventory for each item
        for item in order_data.items:
            # Frontend items: {id, name, price, quantity, ...}
            product_id = item.get('id')
            quantity = item.get('quantity', 1)
            
            if product_id:
                product = db.query(models.Product).filter(models.Product.id == product_id).first()
                if product:
                    # Decrement stock (allow negative for offline sync consistency)
                    product.stock_quantity -= quantity
                    
                    # Create Inventory Log
                    log = models.InventoryLog(
                        product_id=product.id,
                        quantity_change=-quantity,
                        reason="sale",
                        timestamp=order_data.created_at
                    )
                    db.add(log)
        
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
    
    # If no products in DB, seed with defaults
    if not products:
        defaults = [
            models.Product(name="Jollof Rice", price=45.00, category="Main", tax_group="VAT_standard", stock_quantity=50),
            models.Product(name="Fried Rice", price=40.00, category="Main", tax_group="VAT_standard", stock_quantity=50),
            models.Product(name="Grilled Tilapia", price=75.00, category="Main", tax_group="VAT_standard", stock_quantity=20),
            models.Product(name="Kelewele", price=20.00, category="Side", tax_group="VAT_standard", stock_quantity=100)
        ]
        for p in defaults:
            db.add(p)
        db.commit()
        products = db.query(models.Product).all()
        
    return products

# Product CRUD Endpoints
class ProductSchema(BaseModel):
    id: Optional[int] = None
    name: str
    price: float
    category: str
    tax_group: str
    stock_quantity: int = 0
    low_stock_threshold: int = 10
    unit: str = "item"

@router.post("/products")
async def create_product(product: ProductSchema, db: Session = Depends(get_db)):
    new_product = models.Product(
        name=product.name,
        price=product.price,
        category=product.category,
        tax_group=product.tax_group,
        stock_quantity=product.stock_quantity,
        low_stock_threshold=product.low_stock_threshold,
        unit=product.unit
    )
    db.add(new_product)
    db.commit()
    db.refresh(new_product)
    return new_product

@router.put("/products/{product_id}")
async def update_product(product_id: int, product: ProductSchema, db: Session = Depends(get_db)):
    existing = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not existing:
        raise HTTPException(status_code=404, detail="Product not found")
    
    existing.name = product.name
    existing.price = product.price
    existing.category = product.category
    existing.tax_group = product.tax_group
    # Update stock fields
    existing.stock_quantity = product.stock_quantity
    existing.low_stock_threshold = product.low_stock_threshold
    existing.unit = product.unit
    
    db.commit()
    db.refresh(existing)
    return existing

@router.delete("/products/{product_id}")
async def delete_product(product_id: int, db: Session = Depends(get_db)):
    existing = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not existing:
        raise HTTPException(status_code=404, detail="Product not found")
    
    db.delete(existing)
    db.commit()
    return {"status": "deleted", "id": product_id}
