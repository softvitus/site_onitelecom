import React from 'react';
import ReactDOM from 'react-dom/client';
import './global.css';
import App from './App';
import { initTemaEarly } from './servicos/tema';

// Inicializa tema ANTES de montar o React
// Isso garante que as cores CSS estejam disponíveis no Loading
initTemaEarly().then(() => {
  const root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
});
