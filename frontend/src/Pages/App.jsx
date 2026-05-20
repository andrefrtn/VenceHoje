import '../style/App.css'

import Header from '../components/Header/Header'

import { Routes, Route } from 'react-router-dom'


import Dashboard from './Dashboard'
import Calendar from './Calendar'

export default function App() {
  return (
    <>
      <Header />

      <Routes>
        <Route path="/" element={<Dashboard />} />

        <Route path="/calendar" element={<Calendar />} />
      </Routes>
    </>
  )
}