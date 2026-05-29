import { useEffect, useState } from 'react'
import Header from '../components/Header/Header'
import '../style/Calendar.css'

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const CORES_CATEGORIAS = {
  Moradia: '#3B82F6',
  Alimentação: '#22C55E',
  Saúde: '#EF4444',
  Transporte: '#F59E0B',
  Educação: '#8B5CF6',
  Lazer: '#EC4899',
  Assinatura: '#06B6D4',
  Cartão: '#F97316',
  Outro: '#9CA3AF'
}

function formatMoney(val) {
  return Number(val).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}


function parseDateLocal(dateStr) {
  const s = typeof dateStr === 'string' ? dateStr : new Date(dateStr).toISOString()
  const [ano, mes, dia] = s.slice(0, 10).split('-').map(Number)
  return { ano, mes: mes - 1, dia } 
}

function isVencida(conta) {
  if (conta.pago) return false

  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)

  const { ano, mes, dia } = parseDateLocal(conta.vencimento)
  const venc = new Date(ano, mes, dia)

  return venc < hoje
}

export default function Calendar() {
  const token = localStorage.getItem('token')

  const [contas, setContas] = useState([])
  const [currentDate, setCurrentDate] = useState(new Date())

  useEffect(() => {
    fetchContas()
  }, [])

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
    } catch (err) {
      console.log(err)
    }
  }

  const ano = currentDate.getFullYear()
  const mes = currentDate.getMonth()

  const primeiroDia = new Date(ano, mes, 1).getDay()
  const diasNoMes = new Date(ano, mes + 1, 0).getDate()

  const dias = []
  for (let i = 0; i < primeiroDia; i++) dias.push(null)
  for (let i = 1; i <= diasNoMes; i++) dias.push(i)

  function mudarMes(valor) {
    setCurrentDate(new Date(ano, mes + valor, 1))
  }

  function contasDoDia(dia) {
    return contas.filter(conta => {
      const d = parseDateLocal(conta.vencimento)
      return d.dia === dia && d.mes === mes && d.ano === ano
    })
  }

  function labelParcela(conta) {
    if (!conta.grupoRecorrencia || !conta.quantidadeMeses) return ''
    return `${conta.numeroParcela}/${conta.quantidadeMeses}`
  }

  const nomeMes = currentDate.toLocaleDateString('pt-BR', {
    month: 'long',
    year: 'numeric'
  })

  return (
    <>
      <div className="calendar-page">
        <div className="calendar-header">
          <svg
            className="calendar-arrow"
            onClick={() => mudarMes(-1)}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 576 512"
          >
            <path fill="rgb(11, 192, 239)" d="M9.4 278.6c-12.5-12.5-12.5-32.8 0-45.3l128-128c9.2-9.2 22.9-11.9 34.9-6.9S192 115.1 192 128l0 64 336 0c26.5 0 48 21.5 48 48l0 32c0 26.5-21.5 48-48 48l-336 0 0 64c0 12.9-7.8 24.6-19.8 29.6s-25.7 2.2-34.9-6.9l-128-128z" />
          </svg>

          <h1 className="t">{nomeMes}</h1>

          <svg
            className="calendar-arrow"
            onClick={() => mudarMes(1)}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 576 512"
          >
            <path fill="rgb(11, 192, 239)" d="M566.6 233.4c12.5 12.5 12.5 32.8 0 45.3l-128 128c-9.2 9.2-22.9 11.9-34.9 6.9S384 396.9 384 384l0-64-336 0c-26.5 0-48-21.5-48-48l0-32c0-26.5 21.5-48 48-48l336 0 0-64c0-12.9 7.8-24.6 19.8-29.6s25.7-2.2 34.9 6.9l128 128z" />
          </svg>
        </div>

        <div className="calendar-weekdays">
          <span>Dom</span>
          <span>Seg</span>
          <span>Ter</span>
          <span>Qua</span>
          <span>Qui</span>
          <span>Sex</span>
          <span>Sáb</span>
        </div>

        <div className="calendar-grid">
          {dias.map((dia, index) => {
            const contasDia = dia ? contasDoDia(dia) : []

            return (
              <div
                key={index}
                className={`calendar-day ${!dia ? 'empty' : ''}`}
              >
                {dia && (
                  <>
                    <span className="day-number">{dia}</span>

                    <div className="dots-wrap">
                      {contasDia.map(conta => (
                        <span
                          key={conta.id}
                          className={`dot ${isVencida(conta) ? 'dot-vencida' : ''} ${conta.pago ? 'dot-paga' : ''}`}
                          style={{
                            background: CORES_CATEGORIAS[conta.categoria] || '#9CA3AF'
                          }}
                          title={`${conta.descricao}${labelParcela(conta) ? ` (${labelParcela(conta)})` : ''}`}
                        />
                      ))}
                    </div>

                    {contasDia.length > 0 && (
                      <div className="calendar-tooltip">
                        {contasDia.map(conta => (
                          <div key={conta.id} className="tooltip-conta">
                            <div
                              className="tooltip-color"
                              style={{
                                background: CORES_CATEGORIAS[conta.categoria] || '#9CA3AF'
                              }}
                            />
                            <div>
                              <strong>
                                {conta.descricao}
                                {labelParcela(conta) && (
                                  <span className="parcela-label">
                                    {' '}({labelParcela(conta)})
                                  </span>
                                )}
                              </strong>
                              <p>
                                {conta.categoria} • {formatMoney(conta.valor)}
                              </p>
                              {isVencida(conta) && (
                                <span className="vencida-text">Em atraso :(</span>
                              )}
                              {conta.pago && (
                                <span className="paga-text">Paga :)</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            )
          })}
        </div>

        <div className="calendar-legenda">
          {Object.entries(CORES_CATEGORIAS).map(([cat, cor]) => (
            <div key={cat} className="legenda-item">
              <span className="legenda-cor" style={{ background: cor }} />
              {cat}
            </div>
          ))}
        </div>
      </div>
    </>
  )
}