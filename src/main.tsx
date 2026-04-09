import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './context/AuthProvider.tsx'
import { NotificationProvider } from './context/NotificationProvides.tsx'
import { ActionProvider } from './context/ActionProvider.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <NotificationProvider>
        <ActionProvider>
          <App />
        </ActionProvider>
      </NotificationProvider>
    </AuthProvider>
  </StrictMode>,
)
