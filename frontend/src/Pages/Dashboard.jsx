import { useState, useEffect } from 'react'
import '../style/Dashboard.css'
import Header from '../components/Header/Header'

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const CATEGORIAS = [
  'Moradia', 'Alimentação', 'Saúde', 'Transporte',
  'Educação', 'Lazer', 'Assinatura', 'Cartão', 'Outro'
]

function parseDateLocal(dateStr) {
  const s = typeof dateStr === 'string' ? dateStr : new Date(dateStr).toISOString()
  const [ano, mes, dia] = s.slice(0, 10).split('-').map(Number)
  return { ano, mes: mes - 1, dia }
}

function getStatus(conta) {
  if (conta.pago === true || conta.pago === 'true' || conta.pago === 1) return 'pago'

  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)

  const { ano, mes, dia } = parseDateLocal(conta.vencimento)
  const venc = new Date(ano, mes, dia)

  if (venc < hoje) return 'vencido'
  return 'avencer'
}

function formatDate(dateStr) {
  const { ano, mes, dia } = parseDateLocal(dateStr)
  return new Date(ano, mes, dia).toLocaleDateString('pt-BR')
}

function formatMoney(val) {
  return Number(val).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function calcJuros(valor, vencimento, taxaMensal, tipo) {
  const hoje = new Date()
  const { ano, mes, dia } = parseDateLocal(vencimento)
  const venc = new Date(ano, mes, dia)
  const diffMs = hoje - venc
  const diasAtraso = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)))
  const mesesAtraso = diasAtraso / 30
  const taxa = parseFloat(taxaMensal) / 100

  if (isNaN(taxa) || taxa <= 0) return null

  let total
  if (tipo === 'composto') {
    total = valor * Math.pow(1 + taxa, mesesAtraso)
  } else {
    total = valor * (1 + taxa * mesesAtraso)
  }

  return { diasAtraso, jurosValor: total - valor, total }
}

export default function Dashboard() {
  const token = localStorage.getItem('token')
  const storedUser = localStorage.getItem('user')
  const user = storedUser ? JSON.parse(storedUser) : null

  const [contas, setContas] = useState([])
  const [aba, setAba] = useState('avencer')
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [modalParcelas, setModalParcelas] = useState(null)

  const [form, setForm] = useState({
    descricao: '',
    descricaoDetalhada: '',
    valor: '',
    vencimento: '',
    categoria: '',
    pago: false,
    repetir: false,
    quantidadeMeses: 1,
    parcelasPagas: 0
  })

  const [juros, setJuros] = useState({})

  async function fetchContas() {
    try {
      const res = await fetch(`${API}/contas`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      setContas(
        Array.isArray(data)
          ? data.map(c => ({
              ...c,
              valor: Number(c.valor),
              pago: c.pago === true || c.pago === 'true' || c.pago === 1
            }))
          : []
      )
    } catch {
      setErro('Erro ao carregar contas')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchContas() }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setErro('')
    try {
      const res = await fetch(`${API}/contas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(form)
      })
      if (!res.ok) {
        const d = await res.json()
        setErro(d.message || 'Erro ao cadastrar')
      } else {
        setForm({
          descricao: '',
          descricaoDetalhada: '',
          valor: '',
          vencimento: '',
          categoria: '',
          pago: false,
          repetir: false,
          quantidadeMeses: 1,
          parcelasPagas: 0
        })
        setShowForm(false)
        fetchContas()
      }
    } catch {
      setErro('Erro de conexão')
    } finally {
      setSubmitting(false)
    }
  }

  async function executarToggle(conta, pago, parcelas) {
    try {
      await fetch(`${API}/contas/${conta.id}/pagar`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ pago, parcelas })
      })
      fetchContas()
    } catch {
      setErro('Erro ao atualizar')
    }
  }

  function abrirModalParcelas(conta) {
    if (conta.pago) {
      if (!conta.grupoRecorrencia) {
        executarToggle(conta, false, 1)
        return
      }
      const pagas = contas.filter(
        c => c.grupoRecorrencia === conta.grupoRecorrencia && c.pago
      ).length
      setModalParcelas({ conta, modo: 'desfazer', max: pagas, valor: '1', erro: '' })
    } else {
      if (!conta.grupoRecorrencia) {
        executarToggle(conta, true, 1)
        return
      }
      const pagas = contas.filter(
        c => c.grupoRecorrencia === conta.grupoRecorrencia && c.pago
      ).length
      const restantes = Number(conta.quantidadeMeses || 1) - pagas
      setModalParcelas({ conta, modo: 'pagar', max: restantes, valor: '1', erro: '' })
    }
  }

  function confirmarModal() {
    const { conta, modo, max, valor } = modalParcelas
    const num = parseInt(valor, 10)

    if (isNaN(num) || num < 1 || num > max) {
      setModalParcelas(prev => ({
        ...prev,
        erro: `Digite um número entre 1 e ${max}`
      }))
      return
    }

    setModalParcelas(null)
    executarToggle(conta, modo === 'pagar', num)
  }

  function togglePago(conta) {
    abrirModalParcelas(conta)
  }

  async function deletar(id) {
    if (!confirm('Remover esta conta?')) return
    try {
      await fetch(`${API}/contas/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      fetchContas()
    } catch {
      setErro('Erro ao deletar')
    }
  }

const contasFiltradas = contas
  .filter(c => getStatus(c) === aba)
  .filter(conta => {
    if (!conta.grupoRecorrencia) return true

    if (conta.pago) return true

    if (conta.numeroParcela === undefined || conta.numeroParcela === null) return true

    const parcelaAtual = Number(conta.numeroParcela)

    const anterioresNaoPagos = contas.filter(c => {
      if (c.grupoRecorrencia !== conta.grupoRecorrencia) return false
      if (c.pago) return false
      if (c.numeroParcela === undefined || c.numeroParcela === null) return false

      const parcela = Number(c.numeroParcela)
      return parcela < parcelaAtual
    })

    return anterioresNaoPagos.length === 0
  })

const totalAvencer = contas
  .filter(c => getStatus(c) === 'avencer')
  .reduce((s, c) => s + Number(c.valor), 0)

const totalVencido = contas
  .filter(c => getStatus(c) === 'vencido')
  .reduce((s, c) => s + Number(c.valor), 0)

const totalPago = contas
  .filter(c => getStatus(c) === 'pago')
  .reduce((s, c) => s + Number(c.valor), 0)


  return (
    <>
      {modalParcelas && (
        <div className="modal-overlay" onClick={() => setModalParcelas(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h3>
              {modalParcelas.modo === 'pagar'
                ? 'Quantas parcelas deseja pagar?'
                : 'Quantas parcelas deseja desfazer?'}
            </h3>
            <p className="modal-sub">
              <strong>{modalParcelas.conta.descricao}</strong>
              {' — '}máximo {modalParcelas.max} parcela(s)
            </p>
            <input
              type="number"
              min="1"
              max={modalParcelas.max}
              value={modalParcelas.valor}
              placeholder={`1 a ${modalParcelas.max}`}
              onChange={e =>
                setModalParcelas(prev => ({ ...prev, valor: e.target.value, erro: '' }))
              }
              autoFocus
              onKeyDown={e => e.key === 'Enter' && confirmarModal()}
            />
            {modalParcelas.erro && (
              <p className="modal-erro">{modalParcelas.erro}</p>
            )}
            <div className="modal-btns">
              <button className="btn-submit" onClick={confirmarModal}>
                Confirmar
              </button>
              <button className="btn-del" onClick={() => setModalParcelas(null)}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="dash-page">
        <div className="dash-header">
          <div>
            <h1 className="dash-greeting">
              Como estão seus gastos,{' '}
              <span className="dash-name">{user?.name?.split(' ')[0] || 'Usuário'}</span>?
            </h1>
            <p className="dash-sub">Gerencie suas contas e nunca perca um vencimento.</p>
          </div>
          <button className="btn-nova" onClick={() => setShowForm(v => !v)}>
            {showForm ? '✕ Cancelar' : '+ Nova conta'}
          </button>
        </div>

        <div className="dash-cards">
          <div className="dash-card card-avencer" onClick={() => setAba('avencer')}>
            <span className="card-label">A vencer</span>
            <span className="card-valor">{formatMoney(totalAvencer)}</span>
            <span className="card-qtd">{contas.filter(c => getStatus(c) === 'avencer').length} conta(s)</span>
          </div>
          <div className="dash-card card-vencido" onClick={() => setAba('vencido')}>
            <span className="card-label">Vencidas</span>
            <span className="card-valor">{formatMoney(totalVencido)}</span>
            <span className="card-qtd">{contas.filter(c => getStatus(c) === 'vencido').length} conta(s)</span>
          </div>
          <div className="dash-card card-pago" onClick={() => setAba('pago')}>
            <span className="card-label">Pagas</span>
            <span className="card-valor">{formatMoney(totalPago)}</span>
            <span className="card-qtd">{contas.filter(c => getStatus(c) === 'pago').length} conta(s)</span>
          </div>
        </div>

        {showForm && (
          <div className="dash-form-wrap">
            <h2 className="form-title">Cadastrar nova conta</h2>
            {erro && <p className="dash-erro">{erro}</p>}
            <form className="dash-form" onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Nome da conta *</label>
                  <input
                    type="text"
                    placeholder="Ex: Aluguel, Luz, Netflix..."
                    value={form.descricao}
                    onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))}
                    required
                  />
                </div>
                <div className="form-group form-group-sm">
                  <label>Valor (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0,00"
                    value={form.valor}
                    onChange={e => setForm(f => ({ ...f, valor: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Descrição detalhada</label>
                <textarea
                  placeholder="Ex: Conta referente ao aluguel do apartamento..."
                  value={form.descricaoDetalhada}
                  onChange={e => setForm(f => ({ ...f, descricaoDetalhada: e.target.value }))}
                />
              </div>

              <div className="switch-wrap">
                <span className="switch-label">Essa conta vai se repetir?</span>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={form.repetir}
                    onChange={e => setForm(f => ({ ...f, repetir: e.target.checked }))}
                  />
                  <span className="slider"></span>
                </label>
              </div>

              {form.repetir && (
                <div className="form-group">
                  <label>Por quantos meses?</label>
                  <input
                    type="number"
                    min="1"
                    value={form.quantidadeMeses}
                    onChange={e => setForm(f => ({ ...f, quantidadeMeses: e.target.value }))}
                  />
                </div>
              )}

              {form.repetir && form.pago && (
                <div className="form-group">
                  <label>Quantas parcelas já foram pagas?</label>
                  <input
                    type="number"
                    min="0"
                    max={form.quantidadeMeses}
                    value={form.parcelasPagas}
                    onChange={e => setForm(f => ({ ...f, parcelasPagas: e.target.value }))}
                  />
                </div>
              )}

              <div className="form-row">
                <div className="form-group form-group-sm">
                  <label>Vencimento *</label>
                  <input
                    type="date"
                    value={form.vencimento}
                    onChange={e => setForm(f => ({ ...f, vencimento: e.target.value }))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Categoria</label>
                  <select
                    value={form.categoria}
                    onChange={e => setForm(f => ({ ...f, categoria: e.target.value }))}
                  >
                    <option value="">Selecione...</option>
                    {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div className="switch-wrap">
                <span className="switch-label">Conta já foi paga?</span>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={form.pago}
                    onChange={e => setForm(f => ({ ...f, pago: e.target.checked }))}
                  />
                  <span className="slider"></span>
                </label>
              </div>

              <button type="submit" className="btn-submit" disabled={submitting}>
                {submitting ? 'Salvando...' : 'Salvar conta'}
              </button>
            </form>
          </div>
        )}

        <div className="dash-lista">
          {loading && <p className="dash-info">Carregando...</p>}
          {!loading && !erro && contasFiltradas.length === 0 && (
            <div className="dash-vazio">
              <span className="vazio-icon">
                {aba === 'avencer'
                  ? <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="48" height="48"><path fill="rgb(11, 192, 239)" d="M464 256a208 208 0 1 0 -416 0 208 208 0 1 0 416 0zM0 256a256 256 0 1 1 512 0 256 256 0 1 1 -512 0zm177.3 63.4C192.3 335 218.4 352 256 352s63.7-17 78.7-32.6c9.2-9.6 24.4-9.9 33.9-.7s9.9 24.4 .7 33.9c-22.1 23-60 47.4-113.3 47.4s-91.2-24.4-113.3-47.4c-9.2-9.6-8.9-24.8 .7-33.9s24.8-8.9 33.9 .7zM176 180c-15.5 0-28 12.5-28 28l0 8c0 11-9 20-20 20s-20-9-20-20l0-8c0-37.6 30.4-68 68-68s68 30.4 68 68l0 8c0 11-9 20-20 20s-20-9-20-20l0-8c0-15.5-12.5-28-28-28zm132 28l0 8c0 11-9 20-20 20s-20-9-20-20l0-8c0-37.6 30.4-68 68-68s68 30.4 68 68l0 8c0 11-9 20-20 20s-20-9-20-20l0-8c0-15.5-12.5-28-28-28s-28 12.5-28 28z"/></svg>
                  : aba === 'vencido'
                  ? <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" width="48" height="48"><path fill="rgb(11, 192, 239)" d="M530.2 15.9c-8.8-10.7-18.5-20.9-29-30-3-2.6-7.4-2.6-10.4 0-10.5 9.1-20.1 19.3-29 30-14.7 17.8-29.8 40.1-29.8 64.1 0 36.4 27.6 64 64 64s64-27.6 64-64c0-24-15.2-46.3-29.8-64.1zm-132 8.9C364.8 8.9 327.4 0 288 0 146.6 0 32 114.6 32 256S146.6 512 288 512 544 397.4 544 256c0-24.4-3.4-48-9.8-70.4-11.9 4.2-24.7 6.4-38.2 6.4-3.4 0-6.8-.1-10.2-.4 6.6 20.3 10.2 41.9 10.2 64.4 0 114.9-93.1 208-208 208S80 370.9 80 256 173.1 48 288 48c34.8 0 67.5 8.5 96.3 23.6 1.4-17.4 6.9-33.1 13.8-46.8zM423.8 320c4.1-11.6-7.8-21.4-19.6-17.8-34.8 10.6-74.3 16.6-116.3 16.6-41.9 0-81.4-6-116.1-16.5-11.8-3.6-23.7 6.1-19.6 17.8 19.8 55.9 73.1 95.9 135.8 95.9 62.7 0 116-40.1 135.8-96zM180 208c0-15.5 12.5-28 28-28s28 12.5 28 28l0 8c0 11 9 20 20 20s20-9 20-20l0-8c0-37.6-30.4-68-68-68s-68 30.4-68 68l0 8c0 11 9 20 20 20s20-9 20-20l0-8zm188-28c15.5 0 28 12.5 28 28l0 8c0 11 9 20 20 20s20-9 20-20l0-8c0-37.6-30.4-68-68-68s-68 30.4-68 68l0 8c0 11 9 20 20 20s20-9 20-20l0-8c0-15.5 12.5-28 28-28z"/></svg>
                  : <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="48" height="48"><path fill="rgb(11, 192, 239)" d="M256 512a256 256 0 1 1 0-512 256 256 0 1 1 0 512zm0-464a208 208 0 1 0 0 416 208 208 0 1 0 0-416zm70.7 121.9c7.8-10.7 22.8-13.1 33.5-5.3 10.7 7.8 13.1 22.8 5.3 33.5L243.4 366.1c-4.1 5.7-10.5 9.3-17.5 9.8-7 .5-13.9-2-18.8-6.9l-55.9-55.9c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l36 36 105.6-145.2z"/></svg>
                }
              </span>
              <p>Nenhuma conta {aba === 'avencer' ? 'a vencer' : aba === 'vencido' ? 'vencida' : 'paga'} encontrada.</p>
            </div>
          )}

          {!loading && contasFiltradas.map(conta => {
            const j = juros[conta.id] || { taxa: '', tipo: 'simples', aberto: false }
            const calc = j.aberto && j.taxa ? calcJuros(conta.valor, conta.vencimento, j.taxa, j.tipo) : null

            return (
              <div key={conta.id} className={`conta-card status-${getStatus(conta)}`}>
                <div className="conta-info">
                  <div className="conta-top">
                    <span className="conta-desc">{conta.descricao}</span>
                    {conta.categoria && <span className="conta-cat">{conta.categoria}</span>}
                  </div>
                  <div className="conta-bottom">
                    <span className="conta-data">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" width="13" height="13" style={{ marginRight: '5px', verticalAlign: 'middle', flexShrink: 0 }}>
                        <path fill="rgb(11, 192, 239)" d="M128 0C110.3 0 96 14.3 96 32l0 32-32 0C28.7 64 0 92.7 0 128l0 48 448 0 0-48c0-35.3-28.7-64-64-64l-32 0 0-32c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 32-128 0 0-32c0-17.7-14.3-32-32-32zM0 224L0 416c0 35.3 28.7 64 64 64l320 0c35.3 0 64-28.7 64-64l0-192-448 0z" />
                      </svg>
                      {formatDate(conta.vencimento)}
                    </span>
                    {conta.pago && conta.pagoEm && (
                      <span className="conta-pagouEm">Pago em {formatDate(conta.pagoEm)}</span>
                    )}
                    {getStatus(conta) === 'vencido' && (
                      <button
                        className="btn-juros-toggle"
                        onClick={() => setJuros(prev => ({
                          ...prev,
                          [conta.id]: { ...j, aberto: !j.aberto }
                        }))}
                      >
                        % Calcular juros
                      </button>
                    )}
                  </div>

                  {getStatus(conta) === 'vencido' && j.aberto && (
                    <div className="juros-painel">
                      <div className="juros-inputs">
                        <div className="juros-field">
                          <label>Taxa mensal (%)</label>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="Ex: 2"
                            value={j.taxa}
                            onChange={e => setJuros(prev => ({
                              ...prev,
                              [conta.id]: { ...j, taxa: e.target.value }
                            }))}
                          />
                        </div>
                        <div className="juros-field">
                          <label>Tipo</label>
                          <select
                            value={j.tipo}
                            onChange={e => setJuros(prev => ({
                              ...prev,
                              [conta.id]: { ...j, tipo: e.target.value }
                            }))}
                          >
                            <option value="simples">Simples</option>
                            <option value="composto">Composto</option>
                          </select>
                        </div>
                      </div>
                      {calc && (
                        <div className="juros-resultado">
                          <div className="juros-linha">
                            <span>Dias em atraso</span>
                            <span className="juros-val">{calc.diasAtraso} dias</span>
                          </div>
                          <div className="juros-linha">
                            <span>Valor original</span>
                            <span className="juros-val">{formatMoney(conta.valor)}</span>
                          </div>
                          <div className="juros-linha">
                            <span>Juros acumulados</span>
                            <span className="juros-val juros-red">{formatMoney(calc.jurosValor)}</span>
                          </div>
                          <div className="juros-linha juros-total-linha">
                            <span>Total a pagar</span>
                            <span className="juros-val juros-total">{formatMoney(calc.total)}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="conta-acoes">
                  <span className="conta-valor">{formatMoney(conta.valor)}</span>
                  <button
                    className={`btn-pagar ${conta.pago ? 'btn-despagar' : ''}`}
                    onClick={() => togglePago(conta)}
                    title={conta.pago ? 'Marcar como não pago' : 'Marcar como pago'}
                  >
                    {conta.pago ? '↩ Desfazer' : '✓ Pagar'}
                  </button>
                  <button className="btn-del" onClick={() => deletar(conta.id)} title="Remover">✕</button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}
