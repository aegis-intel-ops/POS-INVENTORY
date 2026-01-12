import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { SyncService } from './services/SyncService'

// Start background sync
SyncService.startBackgroundSync(30000); // Sync every 30 seconds

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
