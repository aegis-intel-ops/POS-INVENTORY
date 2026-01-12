import urllib.request
import urllib.error
import json
import sys

BASE_URL = "http://127.0.0.1:8000"

def test_get_products():
    print("Testing GET /sync/products...")
    try:
        with urllib.request.urlopen(f"{BASE_URL}/sync/products") as response:
            if response.status == 200:
                data = json.loads(response.read().decode())
                print(f"SUCCESS: Retrieved {len(data)} products.")
                return True
            else:
                print(f"FAILED: Status {response.status}")
                return False
    except Exception as e:
        print(f"FAILED: {e}")
        return False

def test_post_orders():
    print("\nTesting POST /sync/orders...")
    order_payload = [
        {
            "id": "test_verification_urllib_1",
            "items": [{"product_id": 1, "name": "Test Item", "price": 10.0, "quantity": 1, "tax_amount": 0.0}], 
            # Note: Changed items structure to match Pydantic model expectation roughly or just pass valid dicts
            "total_amount": 10.0,
            "total_tax": 0.0,
            "status": "completed",
            "payment_method": "cash",
            "created_at": "2023-10-27T10:00:00"
        }
    ]
    
    data_json = json.dumps(order_payload).encode('utf-8')
    req = urllib.request.Request(
        f"{BASE_URL}/sync/orders", 
        data=data_json, 
        headers={'Content-Type': 'application/json'}
    )
    
    try:
        with urllib.request.urlopen(req) as response:
            if response.status == 200:
                result = json.loads(response.read().decode())
                print(f"SUCCESS: {result}")
                return True
            else:
                print(f"FAILED: Status {response.status}")
                return False
    except urllib.error.HTTPError as e:
        print(f"FAILED: {e.code} {e.read().decode()}")
        return False
    except Exception as e:
        print(f"FAILED: {e}")
        return False

if __name__ == "__main__":
    products_ok = test_get_products()
    orders_ok = test_post_orders()
    
    if products_ok and orders_ok:
        print("\nAll sync verification tests PASSED.")
        sys.exit(0)
    else:
        print("\nSome tests FAILED.")
        sys.exit(1)
