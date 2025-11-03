
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import * as Recharts from 'recharts';

// Make Recharts globally available to avoid import issues in a single-file-like environment
(window as any).Recharts = Recharts;

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
