from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, ForeignKey, JSON
from sqlalchemy.orm import relationship, declarative_base
from datetime import datetime

Base = declarative_base()

class Product(Base):
    __tablename__ = "products"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    price = Column(Float)
    category = Column(String)
    tax_group = Column(String)

class Order(Base):
    __tablename__ = "orders"
    id = Column(String, primary_key=True) # UUID from frontend or backend generated
    total_amount = Column(Float)
    total_tax = Column(Float)
    status = Column(String)
    payment_method = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Store items as JSON for simplicity in MVP, or relation for normalized
    items_json = Column(JSON) 

