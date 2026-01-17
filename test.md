# Issue Log & Resolution Test

This document tracks significant bugs and technical hurdles encountered during the development of the Receipt, Cancellation, and Kitchen Display features, along with their resolutions.

## 🛑 Critical Issues & Fixes

### 1. Cashier "Access Denied" to Kitchen Display
*   **Issue**: Cashiers were unable to access `/kitchen` despite the link being visible in the sidebar.
*   **Root Cause**: The `ProtectedRoute` component in `App.tsx` did not include `'cashier'` in the `allowedRoles` array for the `/kitchen` route.
*   **Resolution**: Updated `App.tsx` to explicitly allow `['admin', 'kitchen', 'cashier']`.

### 2. Cashier Unauthorized Write Access (KDS)
*   **Issue**: Once access was granted, Cashiers could click "Start Prep" and "Mark Served" buttons, modifying kitchen state.
*   **Requirement**: Cashiers should only *observe* the status.
*   **Resolution**:
    *   Updated `KitchenDisplay.tsx` to check `user.role === 'cashier'`.
    *   Passed a `readOnly` prop to the `OrderCard` component.
    *   Conditionally rendered action buttons based on `!readOnly`.

### 3. Missing Payment Buttons in Cart
*   **Issue**: The "Cash" and "MoMo" payment buttons disappeared from the UI.
*   **Root Cause**: An accidental file truncation during a previous AI edit (using a placeholder like `{/* ... reduced content ... */}`) removed the button JSX code.
*   **Resolution**: Restored the full `Cart.tsx` content from the component logic, ensuring all buttons and modals were re-implemented.

### 4. Kitchen Display Not Showing Orders
*   **Issue**: Orders placed on the terminal were not appearing on the Kitchen Display.
*   **Root Cause**:
    *   `PosTerminal.tsx` was not passing order details (reference IDs) to the database save function effectively.
    *   `SyncService.ts` was not including the new `reference_number` and cash fields in the JSON payload sent to the backend.
    *   Backend `sync.py` `OrderSchema` did not include the new fields, causing data loss or validation errors.
*   **Resolution**:
    *   Updated `handlePlaceOrder` in `PosTerminal` to save all fields to IndexedDB.
    *   Updated `SyncService` mapping to include `amount_tendered`, `change_due`, `reference_number`.
    *   Updated backend `OrderSchema` and `Order` model creation to accept these fields.

### 5. Frontend Layout Import Error
*   **Issue**: `Uncaught ReferenceError: FaHistory is not defined`.
*   **Root Cause**: Added the `<FaHistory />` icon component to the JSX but forgot to add it to the import statement `import { ... } from 'react-icons/fa'`.
*   **Resolution**: Added `FaHistory` to the import list in `Layout.tsx`.

## ✅ Verified Features

| Feature | Role | Expected Behavior | Status |
| :--- | :--- | :--- | :--- |
| **Receipt Reference ID** | System | Order ID (e.g., `ORD-1234-567`) printed on receipt | PASS |
| **Order History** | Cashier/Admin | View list of past 50 orders | PASS |
| **Void Order (< 5m)** | Cashier | Button active, cancels order immediately | PASS |
| **Void Order (> 5m)** | Cashier | Button disabled or requires admin (logic dependent) | PASS |
| **Kitchen View** | Admin/Kitchen | See orders, change status (Pending -> Served) | PASS |
| **Kitchen View** | Cashier | See orders, **NO** status buttons (Read-Only) | PASS |
