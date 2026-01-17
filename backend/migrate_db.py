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
        print("Checking for amount_tendered column...")
        cursor.execute("SELECT amount_tendered FROM orders LIMIT 1")
        print("Column amount_tendered already exists.")
    except sqlite3.OperationalError:
        print("Adding amount_tendered column...")
        cursor.execute("ALTER TABLE orders ADD COLUMN amount_tendered FLOAT")
        print("Column added.")

    try:
        print("Checking for change_due column...")
        cursor.execute("SELECT change_due FROM orders LIMIT 1")
        print("Column change_due already exists.")
    except sqlite3.OperationalError:
        print("Adding change_due column...")
        cursor.execute("ALTER TABLE orders ADD COLUMN change_due FLOAT")
        print("Column added.")

    conn.commit()
    conn.close()
    print("Migration complete.")

if __name__ == "__main__":
    migrate()
