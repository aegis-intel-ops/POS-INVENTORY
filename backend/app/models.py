from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, ForeignKey, JSON
from sqlalchemy.orm import relationship, declarative_base
from datetime import datetime

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(String, default="cashier")  # admin, cashier, kitchen
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    orders = relationship("Order", back_populates="user")
    shifts = relationship("Shift", back_populates="user")

class Shift(Base):
    __tablename__ = "shifts"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    start_time = Column(DateTime, default=datetime.utcnow)
    end_time = Column(DateTime, nullable=True)
    opening_cash = Column(Float, default=0.0)
    closing_cash = Column(Float, nullable=True)
    notes = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    
    user = relationship("User", back_populates="shifts")
    orders = relationship("Order", back_populates="shift")

class Product(Base):
    __tablename__ = "products"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    price = Column(Float)
    category = Column(String)
    tax_group = Column(String)
    # Inventory fields
    stock_quantity = Column(Integer, default=100)
    low_stock_threshold = Column(Integer, default=10)
    unit = Column(String, default="pieces")  # pieces, kg, liters

class Customer(Base):
    __tablename__ = "customers"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    phone = Column(String, unique=True, index=True)
    email = Column(String, nullable=True)
    loyalty_points = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    orders = relationship("Order", back_populates="customer")

class Order(Base):
    __tablename__ = "orders"
    id = Column(String, primary_key=True)  # UUID from frontend or backend generated
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    shift_id = Column(Integer, ForeignKey("shifts.id"), nullable=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=True)
    total_amount = Column(Float)
    total_tax = Column(Float)
    status = Column(String)
    payment_method = Column(String)
    kitchen_status = Column(String, default="pending")  # pending, preparing, ready, served
    kitchen_notes = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Store items as JSON for simplicity in MVP
    items_json = Column(JSON)
    
    user = relationship("User", back_populates="orders")
    shift = relationship("Shift", back_populates="orders")
    customer = relationship("Customer", back_populates="orders")

class InventoryLog(Base):
    __tablename__ = "inventory_logs"
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"))
    quantity_change = Column(Integer)  # positive = add, negative = remove
    reason = Column(String)  # restock, sale, damage, adjustment
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
