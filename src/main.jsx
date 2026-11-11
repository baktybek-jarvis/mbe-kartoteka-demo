import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import '@fontsource-variable/mulish'
import './styles.css'
import App from './App.jsx'

// HashRouter: приложение открывается во фрейме Битрикс24, где путь страницы принадлежит порталу.
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </StrictMode>,
)
