import React from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeProvider } from '@es-rottay/designsystem-core';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider defaultTemplate="base">
      <App />
    </ThemeProvider>
  </React.StrictMode>
);
