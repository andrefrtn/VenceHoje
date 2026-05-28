import React, { useState, useEffect } from 'react';
import Header from '../components/Header/Header';
import '../style/verinfos.css';
import { Link, useNavigate, useLocation } from 'react-router-dom'; 

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000';



export default function Verinfos() {
  const [infos, setInfos] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  
  const navigate = useNavigate(); 

  function editarinfos(){
       navigate("/myinfos");
  }

  useEffect(() => {
    async function loadInfos() {
      try {
        const token = localStorage.getItem("token");

        const response = await fetch(`${API}/myinfos`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();
        setInfos(data);

      } catch (err) {
        console.log(err);
      }
    }

    loadInfos();
  }, []);

  if (!infos) {
    return (
      <div className="infos-page">
        <p className="infos-loading">Carregando informações...</p>
      </div>
    );
  }

  return (
    <>

      <div className="infos-page">
        <div className="infos-card">
          <div className="infos-top">
            <div>
              <h1 className="infos-title">
                Suas <span>Informações</span>
              </h1>
              <p className="infos-sub">Dados financeiros cadastrados</p>
            </div>

            <div className="menu-wrap">
              <button className="menu-btn" onClick={() => setMenuOpen(!menuOpen)}>
                ⋮
              </button>

              {menuOpen && (
                <div className="drop">
                  <button className='minhasinfos' onClick={editarinfos}>
                    Editar minhas informações
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="infos-grid">
            <div className="info-box"><span>Salário</span><strong>R$ {infos.salario || 0}</strong></div>
            <div className="info-box"><span>Renda Extra</span><strong>R$ {infos.rendaExtra || 0}</strong></div>
            <div className="info-box"><span>Gastos Fixos</span><strong>R$ {infos.gastosFixos || 0}</strong></div>
            <div className="info-box"><span>Gastos Variáveis</span><strong>R$ {infos.gastosVariaveis || 0}</strong></div>
            <div className="info-box"><span>Aluguel</span><strong>R$ {infos.aluguel || 0}</strong></div>
            <div className="info-box"><span>Financiamentos</span><strong>R$ {infos.financiamento || 0}</strong></div>
            <div className="info-box"><span>Cartão</span><strong>R$ {infos.cartao || 0}</strong></div>
            <div className="info-box"><span>Dependentes</span><strong>{infos.dependentes || 0}</strong></div>
            <div className="info-box"><span>Objetivo</span><strong>{infos.objetivo || 'Não definido'}</strong></div>
            <div className="info-box"><span>Reserva</span><strong>{infos.reserva || 'Não definido'}</strong></div>
            <div className="info-box"><span>Investimentos</span><strong>{infos.investimentos || 'Não possui'}</strong></div>
            <div className="info-box"><span>Dívidas</span><strong>R$ {infos.dividas || 0}</strong></div>
            
          </div>
        </div>
      </div>
    </>
  );
}
