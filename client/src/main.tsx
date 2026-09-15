import { StrictMode } from 'react'

// Force dark theme globally
if (typeof document !== 'undefined') {
  document.documentElement.classList.add('dark');
}
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx';
import { BrowserRouter } from 'react-router-dom';
import {Toaster} from 'react-hot-toast';
import { Provider } from 'react-redux';
import { store } from '@/store/index.ts';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
    <Provider store={store}>
        <App />
    </Provider>
    </BrowserRouter>
    <Toaster 
      toastOptions={{
        duration: 3000
      }}
    />
  </StrictMode>,
)
