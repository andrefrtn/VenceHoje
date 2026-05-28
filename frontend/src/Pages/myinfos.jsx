import React, { useState, useEffect } from 'react';
import Header from '../components/Header/Header';
import '../style/myinfos.css';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000';




export default function Myinfos() {
  const [form, setForm] = useState({
    salario: '',
    rendaExtra: '',
    gastosFixos: '',
    gastosVariaveis: '',
    aluguel: '',
    financiamento: '',
    cartao: '',
    dependentes: '',
    objetivo: '',
    reserva: '',
  });

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

      if (data) {
        setForm({
          salario: data.salario || '',
          rendaExtra: data.rendaExtra || '',
          gastosFixos: data.gastosFixos || '',
          gastosVariaveis: data.gastosVariaveis || '',
          aluguel: data.aluguel || '',
          financiamento: data.financiamento || '',
          cartao: data.cartao || '',
          dependentes: data.dependentes || '',
          objetivo: data.objetivo || '',
          reserva: data.reserva || '',
        });
      }

    } catch (err) {
      console.log(err);
    }
  }

  loadInfos();
}, []);

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

function retornar(){
    Navigate('/dashboard')
}
  

async function handleSubmit(e) {
  e.preventDefault();

  try {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API}/myinfos`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(form),
    });

    const data = await response.json();

    if (!response.ok) {
      return alert(data.message);
    }

    alert("Informações salvas com sucesso!");
    retornar();

  } catch (err) {
    console.log(err);
    alert("Erro ao salvar");
  }
}

  return (
    <>
     

      <div className="dash-page">
        <div className="dash-header">
          <div>
            <h1 className="dash-greeting">
              Suas <span className="dash-name">Informações Financeiras</span>
            </h1>

            <p className="dash-sub">
              Preencha seus dados para receber análises e controle financeiro.
            </p>
          </div>
        </div>

        <div className="dash-form-wrap">
          <h2 className="form-title">Dados Econômicos</h2>

          <form className="dash-form" onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Salário Mensal</label>
                <input
                  type="number"
                  name="salario"
                  placeholder="R$ 0,00"
                  value={form.salario}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Renda Extra</label>
                <input
                  type="number"
                  name="rendaExtra"
                  placeholder="R$ 0,00"
                  value={form.rendaExtra}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Gastos Fixos</label>
                <input
                  type="number"
                  name="gastosFixos"
                  placeholder="Ex: contas, internet..."
                  value={form.gastosFixos}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Gastos Variáveis</label>
                <input
                  type="number"
                  name="gastosVariaveis"
                  placeholder="Ex: lazer, compras..."
                  value={form.gastosVariaveis}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Valor do Aluguel</label>
                <input
                  type="number"
                  name="aluguel"
                  placeholder="R$ 0,00"
                  value={form.aluguel}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Financiamentos</label>
                <input
                  type="number"
                  name="financiamento"
                  placeholder="R$ 0,00"
                  value={form.financiamento}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Fatura Média do Cartão</label>
                <input
                  type="number"
                  name="cartao"
                  placeholder="R$ 0,00"
                  value={form.cartao}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group form-group-sm">
                <label>Dependentes</label>
                <input
                  type="number"
                  name="dependentes"
                  placeholder="0"
                  value={form.dependentes}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Objetivo Financeiro</label>

                <select
                  name="objetivo"
                  value={form.objetivo}
                  onChange={handleChange}
                  required
                >
                  <option value="">Selecione</option>
                  <option value="economizar">Economizar</option>
                  <option value="investir">Investir</option>
                  <option value="quitar-dividas">Quitar dívidas</option>
                  <option value="comprar-bem">Comprar um bem</option>
                  <option value="organizar">Se organizar</option>
                </select>
              </div>

              <div className="form-group">
                <label>Reserva de Emergência</label>

                <select
                  name="reserva"
                  value={form.reserva}
                  onChange={handleChange}
                  required
                >
                  <option value="">Selecione</option>
                  <option value="Não possui">Não tenho</option>
                  <option value="menos de 3">Menos de 3 meses</option>
                  <option value="3-6">3 a 6 meses</option>
                  <option value="mais-6">Mais de 6 meses</option>
                </select>
              </div>
            </div>

            <button className="btn-submit" type="submit">
              Salvar Informações
            </button>
          </form>
        </div>
      </div>
    </>
  );
}