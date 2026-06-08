import '../style/App.css'

import Header from '../components/Header/Header'
import ProtectedRoute from '../components/ProtectedRoute'

import { Routes, Route } from 'react-router-dom'

import Dashboard from './Dashboard'
import Calendar from './Calendar'
import Choose from './choose'
import Myinfos from './myinfos'
import Verinfos from './verinfos'
import Contas from './contas'
import Relatorio from './relatorio'

export default function App() {
  return (
    <>
      <Header />

      <Routes>

        <Route path="/" element={<Choose />} />

        <Route
          path="/calendar"
          element={
            <ProtectedRoute>
              <Calendar />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />


            <Route
          path="/myinfos"
          element={
            <ProtectedRoute>
              <Myinfos />
            </ProtectedRoute>
          }
        />


          <Route
            path="/verinfos"
            element={
              <ProtectedRoute>
                <Verinfos />
              </ProtectedRoute>
            }
          />

          

              <Route
            path="/contas"
            element={
              <ProtectedRoute>
                <Contas />
              </ProtectedRoute>
            }
          />


              <Route
            path="/relatorio"
            element={
              <ProtectedRoute>
                <Relatorio />
              </ProtectedRoute>
            }
          />

      </Routes>
    </>
  )
}