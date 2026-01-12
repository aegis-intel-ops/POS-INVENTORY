from sqlalchemy import create_engine, inspect
import sys

# Check both DBs to be sure
dbs = ["restaurant.db", "restaurant_v2.db"]

for db_file in dbs:
    print(f"\n--- Checking {db_file} ---")
    try:
        engine = create_engine(f"sqlite:///./{db_file}")
        inspector = inspect(engine)
        tables = inspector.get_table_names()
        print(f"Tables: {tables}")
        
        if "users" in tables:
            columns = [c["name"] for c in inspector.get_columns("users")]
            print(f"Users columns: {columns}")
        
        if "products" in tables:
            columns = [c["name"] for c in inspector.get_columns("products")]
            print(f"Products columns: {columns}")
            
    except Exception as e:
        print(f"Error reading {db_file}: {e}")
