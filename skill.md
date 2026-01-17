# Agent Skills & Project Context

This document outlines the specific skills, domain knowledge, and technical context required for AI agents (and human developers) to effectively work on the GhanaPOS project.

## 🧠 Domain Knowledge (Ghana Context)
*   **Taxation Structure**:
    *   **NHIL (National Health Insurance Levy)**: 2.5% of subtotal.
    *   **GETFund (Ghana Education Trust Fund)**: 2.5% of subtotal.
    *   **COVID-19 HRL (Health Recovery Levy)**: 1% of subtotal.
    *   **VAT (Value Added Tax)**: 15% of (Subtotal + NHIL + GETFund + COVID). *Note: The tax base for VAT includes the other levies.*
*   **Payment Methods**:
    *   **Mobile Money (MoMo)**: Primary digital payment method (MTN, Vodafone/Telecel, AirtelTigo). Requires provider selection and phone number validation.
    *   **Cash**: Requires exact change calculation and receipt generation.

## 🛠️ Technical Stack & Skills

### Frontend (React + TypeScript)
*   **Offline-First Architecture**: Extensive use of `Dexie.js` (IndexedDB) for local data storage. The app must function without an internet connection.
*   **UI/UX**: `Tailwind CSS` for styling. Focus on high-contrast, touch-friendly interfaces (Tablets/POS terminals).
*   **State Management**: React Context (`AuthContext`) for user sessions.
*   **Synchronization**: Custom `SyncService` to push offline orders to the backend when online.

### Backend (FastAPI + Python)
*   **API Design**: RESTful endpoints for Orders, Products, and Shifts.
*   **Database**: `SQLAlchemy` with `SQLite` for easy deployment/portability.
*   **Background Tasks**: Handling long-running sync processes or mock payment verifications.
*   **Environment**: Running primarily in WSL (Windows Subsystem for Linux) within a Windows host.

### Infrastructure & DevOps
*   **WSL Management**: Ability to navigate Linux file systems (`/home/...`) from Windows (`C:\Users\...`) and manage processes using specific WSL commands.
*   **Process Management**: Skills to identify and kill stale server processes (port 8000/5173 conflicts) using `lsof`, `kill`, or PowerShell equivalents.
*   **Git Workflow**: Commit, operations, and keeping branches in sync.

## 🧩 Specific Agent Workflows (Workflows)

### 1. "Restarting the Environment"
If the development servers stall or throw connection errors:
1.  Kill existing node/python processes.
2.  Start Backend: `cd backend && uvicorn app.main:app --reload`
3.  Start Frontend: `cd frontend && npm run dev`

### 2. "Database Migration"
When modifying `models.py`:
1.  Create a migration script (e.g., `migrate_db_new_col.py`) using SQLAlchemy engine.
2.  Run script to alter SQLite table structure (SQLite does not support all ALTER COLUMN operations natively, often requires table rebuild pattern or minimal adds).
