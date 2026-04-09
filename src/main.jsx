import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { FamilyProvider } from './context/FamilyContext.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <FamilyProvider>
      <App />
    </FamilyProvider>
  </React.StrictMode>,
)
