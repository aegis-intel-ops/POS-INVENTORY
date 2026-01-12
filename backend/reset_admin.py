import sys
import os

# Add backend to path
sys.path.append(os.getcwd())

from app.database import SessionLocal
from app import models
from app.api.auth import get_password_hash

print("--- Resetting Admin User ---")
db = SessionLocal()

try:
    # Check if admin exists
    admin = db.query(models.User).filter(models.User.username == "admin").first()
    
    if admin:
        print("Admin found. Updating password...")
        admin.hashed_password = get_password_hash("admin123")
        admin.is_active = True
        print("Password updated to 'admin123'")
    else:
        print("Admin not found. Creating new admin...")
        admin = models.User(
            username="admin",
            email="admin@restaurant.local",
            hashed_password=get_password_hash("admin123"),
            role="admin",
            is_active=True
        )
        db.add(admin)
        print("Admin user created (admin / admin123)")
    
    db.commit()
    print("SUCCESS: Admin user is ready.")

except Exception as e:
    print(f"ERROR: {e}")
    import traceback
    traceback.print_exc()

db.close()
