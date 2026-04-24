import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './context/AuthProvider.tsx'
import { NotificationProvider } from './context/NotificationProvider.tsx'
import { ActionProvider } from './context/ActionProvider.tsx'
import { AdminProvider } from './context/AdminProvider.tsx'
import { SettingProvider } from './context/SettingProcider.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <AdminProvider>
        <NotificationProvider>
                <ActionProvider>
                  <SettingProvider>
                               <App />
                  </SettingProvider>
                </ActionProvider>
        </NotificationProvider>
      </AdminProvider>
    </AuthProvider>
  </StrictMode>,
)
