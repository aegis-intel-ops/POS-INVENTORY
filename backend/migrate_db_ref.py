import sqlite3
import os

DB_PATH = "restaurant_v2.db"

def migrate():
    if not os.path.exists(DB_PATH):
        print(f"Database {DB_PATH} not found.")
        return

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    try:
        print("Checking for reference_number column...")
        cursor.execute("SELECT reference_number FROM orders LIMIT 1")
        print("Column reference_number already exists.")
    except sqlite3.OperationalError:
        print("Adding reference_number column...")
        cursor.execute("ALTER TABLE orders ADD COLUMN reference_number TEXT")
        print("Column added.")

    conn.commit()
    conn.close()
    print("Migration complete.")

if __name__ == "__main__":
    migrate()
