import '../style/App.css'

import Header from '../components/Header/Header'

import { Routes, Route } from 'react-router-dom'


import Dashboard from './Dashboard'
import Calendar from './Calendar'
import Choose from './choose'

export default function App() {
  return (
    <>
      <Header />

      <Routes>
        <Route path="/" element={<Choose />} />

        <Route path="/calendar" element={<Calendar />} />

        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </>
  )
}