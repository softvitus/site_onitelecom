import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './estilos/variables.css'
import './estilos/global.css'
import App from './App.jsx'
import { initTemaEarly } from './servicos/tema'

// Inicializa tema ANTES de montar o React
// Isso garante que título, favicon e cores estejam aplicados
initTemaEarly().then(() => {
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
})
