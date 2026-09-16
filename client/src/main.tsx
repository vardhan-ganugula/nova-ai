import { StrictMode } from 'react'

// Force dark theme globally
if (typeof document !== 'undefined') {
  document.documentElement.classList.add('dark');
}
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx';
import { BrowserRouter } from 'react-router-dom';
import { Toaster, ToastBar, toast } from 'react-hot-toast';
import { Provider } from 'react-redux';
import { store } from '@/store/index.ts';
import { X } from 'lucide-react';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Provider store={store}>
        <App />
      </Provider>
    </BrowserRouter>
    <Toaster 
      position="bottom-right"
      gutter={10}
      toastOptions={{
        duration: 3500,
        style: {
          background: 'rgba(18, 18, 22, 0.95)',
          color: '#f4f4f5',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          padding: '12px 16px',
          borderRadius: '14px',
          boxShadow: '0 20px 45px -10px rgba(0, 0, 0, 0.9), 0 0 1px 1px rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(16px)',
          fontSize: '13px',
          fontWeight: 500,
          letterSpacing: '-0.01em',
          maxWidth: '440px',
        },
        success: {
          iconTheme: {
            primary: '#10b981',
            secondary: '#09090b',
          },
          style: {
            border: '1px solid rgba(16, 185, 129, 0.3)',
            background: 'linear-gradient(135deg, rgba(16, 24, 20, 0.96) 0%, rgba(12, 16, 14, 0.98) 100%)',
          },
        },
        error: {
          duration: 4500,
          iconTheme: {
            primary: '#f43f5e',
            secondary: '#09090b',
          },
          style: {
            border: '1px solid rgba(244, 63, 94, 0.3)',
            background: 'linear-gradient(135deg, rgba(28, 16, 18, 0.96) 0%, rgba(18, 12, 14, 0.98) 100%)',
          },
        },
        loading: {
          iconTheme: {
            primary: '#f97316',
            secondary: '#09090b',
          },
          style: {
            border: '1px solid rgba(249, 115, 22, 0.3)',
            background: 'linear-gradient(135deg, rgba(28, 20, 14, 0.96) 0%, rgba(18, 14, 10, 0.98) 100%)',
          },
        },
      }}
    >
      {(t) => (
        <ToastBar toast={t}>
          {({ icon, message }) => (
            <div className="flex items-center gap-2.5 w-full">
              <span className="shrink-0">{icon}</span>
              <div className="flex-1 text-xs sm:text-[13px] leading-snug">{message}</div>
              {t.type !== 'loading' && (
                <button
                  onClick={() => toast.dismiss(t.id)}
                  className="p-1 rounded-md text-zinc-500 hover:text-white hover:bg-white/10 transition-colors ml-1 shrink-0 cursor-pointer"
                  title="Dismiss"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          )}
        </ToastBar>
      )}
    </Toaster>
  </StrictMode>,
)
