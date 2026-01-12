import sys
import os

# Add backend to path
sys.path.append(os.getcwd())

try:
    from app import main
    print("SUCCESS: app.main imported")
    from app.api import shifts
    print("SUCCESS: app.api.shifts imported")
    from app.api import users
    print("SUCCESS: app.api.users imported")
except Exception as e:
    print(f"ERROR: {e}")
    import traceback
    traceback.print_exc()
