import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { AppDataProvider } from './context/AppDataContext.jsx'

const root = createRoot(document.getElementById('root'))

if (import.meta.env.DEV) {
  root.render(
    <StrictMode>
      <AppDataProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </AppDataProvider>
    </StrictMode>,
  )
} else {
  root.render(
    <AppDataProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </AppDataProvider>
  )
}
