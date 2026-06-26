
import React, { useState, useEffect } from 'react';
import '../style/myinfos.css';
import { useNavigate } from 'react-router-dom';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function Myinfos() {

  const navigate = useNavigate();

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
    investimentos: '',
    dividas: '',
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
            investimentos: data.investimentos || '',
            dividas: data.dividas || '',
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

      navigate('/verinfos');

    } catch (err) {

      console.log(err);
      alert("Erro ao salvar");

    }

  }

  return (
    <div className="infos-container">

      <div className="infos-hero">

        <div>
          <h1 className="infos-title">
            Suas <span>Informações Financeiras</span>
          </h1>

          <p className="infos-subtitle">
            Preencha seus dados para receber análises financeiras inteligentes.
          </p>
        </div>

      </div>

      <form className="infos-form" onSubmit={handleSubmit}>

        <div className="form-section">

          <div className="section-head">
            <div className="section-icon"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="rgb(11, 192, 239)" d="M64 32C28.7 32 0 60.7 0 96L0 384c0 35.3 28.7 64 64 64l384 0c35.3 0 64-28.7 64-64l0-192c0-35.3-28.7-64-64-64L72 128c-13.3 0-24-10.7-24-24S58.7 80 72 80l384 0c13.3 0 24-10.7 24-24s-10.7-24-24-24L64 32zM416 256a32 32 0 1 1 0 64 32 32 0 1 1 0-64z"/></svg></div>

            <div>
              <h2>Renda e Receitas</h2>
              <p>Dados sobre ganhos mensais</p>
            </div>
          </div>

          <div className="form-grid">

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

        </div>

        <div className="form-section">

          <div className="section-head">
            <div className="section-icon"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="rgb(11, 192, 239)" d="M64 64c0-17.7-14.3-32-32-32S0 46.3 0 64L0 400c0 44.2 35.8 80 80 80l400 0c17.7 0 32-14.3 32-32s-14.3-32-32-32L80 416c-8.8 0-16-7.2-16-16L64 64zm406.6 86.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L320 210.7 262.6 153.4c-12.5-12.5-32.8-12.5-45.3 0l-96 96c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l73.4-73.4 57.4 57.4c12.5 12.5 32.8 12.5 45.3 0l128-128z"/></svg></div>

            <div>
              <h2>Gastos Mensais</h2>
              <p>Custos fixos e variáveis</p>
            </div>
          </div>

          <div className="form-grid">

            <div className="form-group">
              <label>Gastos Fixos</label>

              <input
                type="number"
                name="gastosFixos"
                placeholder="R$ 0,00"
                value={form.gastosFixos}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Gastos Variáveis</label>

              <input
                type="number"
                name="gastosVariaveis"
                placeholder="R$ 0,00"
                value={form.gastosVariaveis}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Aluguel</label>

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

            <div className="form-group">
              <label>Fatura do Cartão</label>

              <input
                type="number"
                name="cartao"
                placeholder="R$ 0,00"
                value={form.cartao}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Dívidas Atuais</label>

              <input
                type="number"
                name="dividas"
                placeholder="R$ 0,00"
                value={form.dividas}
                onChange={handleChange}
              />
            </div>

          </div>

        </div>

        <div className="form-section">

          <div className="section-head">
            <div className="section-icon"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="rgb(11, 192, 239)" d="M192 80c0-26.5 21.5-48 48-48l32 0c26.5 0 48 21.5 48 48l0 352c0 26.5-21.5 48-48 48l-32 0c-26.5 0-48-21.5-48-48l0-352zM0 272c0-26.5 21.5-48 48-48l32 0c26.5 0 48 21.5 48 48l0 160c0 26.5-21.5 48-48 48l-32 0c-26.5 0-48-21.5-48-48L0 272zM432 96l32 0c26.5 0 48 21.5 48 48l0 288c0 26.5-21.5 48-48 48l-32 0c-26.5 0-48-21.5-48-48l0-288c0-26.5 21.5-48 48-48z"/></svg></div>

            <div>
              <h2>Perfil Financeiro</h2>
              <p>Objetivos e organização</p>
            </div>
          </div>

          <div className="form-grid">

            <div className="form-group">
              <label>Dependentes</label>

              <input
                type="number"
                name="dependentes"
                placeholder="0"
                value={form.dependentes}
                onChange={handleChange}
              />
            </div>

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

            <div className="form-group">
              <label>Investimentos</label>

              <select
                name="investimentos"
                value={form.investimentos}
                onChange={handleChange}
                required
              >
                <option value="">Selecione</option>
                <option value="nao">Não possuo</option>
                <option value="poupanca">Poupança</option>
                <option value="renda-fixa">Renda fixa</option>
                <option value="acoes">Ações</option>
                <option value="cripto">Criptomoedas</option>
              </select>
            </div>

          </div>

        </div>

        <button className="submit-btn" type="submit">
          Salvar Informações
        </button>

      </form>

    </div>
  );
}

