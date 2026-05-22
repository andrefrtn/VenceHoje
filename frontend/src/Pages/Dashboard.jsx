
import '../style/Dashboard.css'
import Carrossel from "../components/Carrossel/Carrossel"



import Header from '../components/Header/Header'

import { Routes, Route } from 'react-router-dom'


export default function Dashboard() {


    const token = localStorage.getItem("token")
  const storedUser = localStorage.getItem("user")
  const user = storedUser ? JSON.parse(storedUser) : null



  return (
  <>
  
<div className='central'>
  <h1 className='title'>
    Como estão os seus gastos,{" "}
    <span>{user?.name || "Usuário"}</span>?
  </h1>
</div>


  </>
  )
}