from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import Optional
import uuid
import time
import asyncio

router = APIRouter(prefix="/momo", tags=["momo"])

# In-memory store for mock transactions
# In production, this would be in the database
mock_transactions = {}

class PaymentRequest(BaseModel):
    items: list
    total_amount: float
    phone: str
    provider: str # 'mtn', 'vodafone', 'airteltigo'

class PaymentResponse(BaseModel):
    transaction_id: str
    status: str
    message: str

class PaymentStatus(BaseModel):
    transaction_id: str
    status: str # 'PENDING', 'SUCCESS', 'FAILED'

async def simulate_user_approval(transaction_id: str):
    """Simulate the user approving the USSD prompt after a delay"""
    await asyncio.sleep(5) # Wait 5 seconds
    if transaction_id in mock_transactions:
        mock_transactions[transaction_id]['status'] = 'SUCCESS'
        print(f"Mock MoMo: Transaction {transaction_id} approved by user.")

@router.post("/request", response_model=PaymentResponse)
async def request_payment(request: PaymentRequest, background_tasks: BackgroundTasks):
    print(f"Mock MoMo: Request received for {request.phone} - GHS {request.total_amount}")
    
    transaction_id = str(uuid.uuid4())
    
    # Store initial pending state
    mock_transactions[transaction_id] = {
        'status': 'PENDING',
        'amount': request.total_amount,
        'phone': request.phone,
        'provider': request.provider,
        'created_at': time.time()
    }
    
    # Schedule the mock approval
    background_tasks.add_task(simulate_user_approval, transaction_id)
    
    return {
        "transaction_id": transaction_id,
        "status": "PENDING",
        "message": "Payment request sent. Please approve on your phone."
    }

@router.get("/status/{transaction_id}")
async def check_status(transaction_id: str):
    if transaction_id not in mock_transactions:
        raise HTTPException(status_code=404, detail="Transaction not found")
        
    return {
        "transaction_id": transaction_id,
        "status": mock_transactions[transaction_id]['status']
    }
