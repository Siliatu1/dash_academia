import { Routes, Route } from 'react-router-dom'
import Navbar from './componentes/Navbar'
import Dashboard_act from './componentes/Dashboard_act'
import Asistencia from './componentes/Asistencia'
import AsistenciaLideres from './componentes/AsistenciaLideres'
import DetallePersonas from './componentes/DetallePersonas'
import InscripcionDiplomado from './componentes/InscripcionDiplomado'
import { useAppData } from './context/AppDataContext'
import './styles/App.css'
import './componentes/styles/pagination.css'

function App() {
  const { refreshSharedData } = useAppData()

  return (
    <div className="app-layout">
      <Navbar onRefresh={refreshSharedData} />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Dashboard_act />} />
          <Route path="/asistencia" element={<Asistencia />} />
          <Route path="/asistencia-lideres" element={<AsistenciaLideres />} />
          <Route path="/detalle-personas" element={<DetallePersonas />} />
          <Route path="/inscripcion-diplomado" element={<InscripcionDiplomado />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
