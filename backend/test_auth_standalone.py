import sys
import os

# Add backend to path
sys.path.append(os.getcwd())

from app.database import SessionLocal, engine
from app import models
from app.api.auth import get_password_hash, UserCreate
from sqlalchemy.exc import OperationalError

print("--- Testing DB Connection ---")
db = SessionLocal()
try:
    count = db.query(models.User).count()
    print(f"User count: {count}")
except OperationalError as e:
    print(f"DB Error: {e}")
    # Try creating tables if missing
    print("Attempting to create tables...")
    models.Base.metadata.create_all(bind=engine)
    print("Tables created.")

print("\n--- Testing Password Hashing ---")
try:
    hash = get_password_hash("test")
    print(f"Hash generarted: {hash[:10]}...")
except Exception as e:
    print(f"Hashing Error: {e}")

print("\n--- Testing Admin Insertion ---")
try:
    # Check if admin exists
    admin = db.query(models.User).filter(models.User.username == "admin").first()
    if admin:
        print("Admin user already exists.")
    else:
        print("Creating admin user...")
        new_user = models.User(
            username="admin",
            email="admin@restaurant.local",
            hashed_password=get_password_hash("admin123"),
            role="admin"
        )
        db.add(new_user)
        db.commit()
        print("Admin user created!")
except Exception as e:
    print(f"Insertion Error: {e}")
    import traceback
    traceback.print_exc()

db.close()
