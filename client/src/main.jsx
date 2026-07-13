import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App.jsx'
import './styles/index.css'
import './i18n'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <App />
      <Toaster
        position="top-right"
        reverseOrder={false}
        gutter={10}
        containerStyle={{
          top: 20,
          right: 20,
        }}
        toastOptions={{
          duration: 4000,
          style: {
            background:   'rgba(13, 21, 48, 0.95)',
            backdropFilter: 'blur(20px)',
            border:       '1px solid rgba(255,255,255,0.10)',
            borderRadius: '14px',
            color:        '#f8fafc',
            fontSize:     '14px',
            fontWeight:   '500',
            padding:      '14px 18px',
            boxShadow:    '0 8px 32px rgba(0,0,0,0.4)',
            maxWidth:     '380px',
          },
          success: {
            iconTheme: {
              primary:    '#10b981',
              secondary:  '#f8fafc',
            },
            style: {
              background:   'rgba(13, 21, 48, 0.95)',
              border:       '1px solid rgba(16, 185, 129, 0.25)',
            },
          },
          error: {
            iconTheme: {
              primary:    '#ef4444',
              secondary:  '#f8fafc',
            },
            style: {
              background:   'rgba(13, 21, 48, 0.95)',
              border:       '1px solid rgba(239, 68, 68, 0.25)',
            },
          },
          loading: {
            iconTheme: {
              primary:    '#2563eb',
              secondary:  'transparent',
            },
          },
        }}
      />
    </BrowserRouter>
  </React.StrictMode>,
)