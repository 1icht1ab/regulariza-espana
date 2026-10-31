import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import { AuthProvider } from './context/AuthContext'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import MiTramite from './pages/MiTramite'
import Requisitos from './pages/Requisitos'
import Foro from './pages/Foro'
import Hilo from './pages/Hilo'
import Expediente from './pages/Expediente'
import Privacidad from './pages/Privacidad'
import Entrar from './pages/Entrar'
import NoEncontrado from './pages/NoEncontrado'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="mi-tramite" element={<MiTramite />} />
            <Route path="requisitos" element={<Requisitos />} />
            <Route path="foro" element={<Foro />} />
            <Route path="foro/:id" element={<Hilo />} />
            <Route path="expediente" element={<Expediente />} />
            <Route path="privacidad" element={<Privacidad />} />
            <Route path="entrar" element={<Entrar />} />
            <Route path="*" element={<NoEncontrado />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>,
)
