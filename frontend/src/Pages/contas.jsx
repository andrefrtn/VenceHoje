import { useEffect, useMemo, useState } from 'react'
import '../style/contas.css'

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000'

function formatMoney(val) {
  return Number(val).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  })
}

function formatDate(date) {
  return new Date(date).toLocaleDateString('pt-BR')
}

export default function SobreContas() {
  const token = localStorage.getItem('token')

  const [contas, setContas] = useState([])
  const [selecionada, setSelecionada] = useState(null)
  const [loading, setLoading] = useState(true)

  async function fetchContas() {
    try {
      const res = await fetch(`${API}/contas`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      const data = await res.json()
      setContas(Array.isArray(data) ? data : [])
    } catch (err) {
      console.log(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchContas()
  }, [])

  const contasUnicas = useMemo(() => {
    const mapa = new Map()

    contas.forEach(conta => {
      if (!conta.grupoRecorrencia) {
        mapa.set(conta.id, conta)
        return
      }

      if (!mapa.has(conta.grupoRecorrencia)) {
        mapa.set(conta.grupoRecorrencia, conta)
      }
    })

    return Array.from(mapa.values())
  }, [contas])

  return (
    <div className="dash-page">
      <div className="dash-header">
        <div>
          <h1 className="dash-greeting">Sobre suas contas</h1>
          <p className="dash-sub">
            Veja detalhes completos das contas cadastradas.
          </p>
        </div>
      </div>

      <div className="contas-layout">
        <div className="contas-lista">
          {loading && <p className="muted">Carregando...</p>}

          {!loading && contasUnicas.length === 0 && (
            <p className="muted">Nenhuma conta encontrada.</p>
          )}

          {contasUnicas.map(conta => (
            <div
              key={conta.id}
              onClick={() => setSelecionada(conta)}
              className={`conta-card ${
                selecionada?.id === conta.id ? 'active' : ''
              }`}
            >
              <div className="conta-topo">
                <strong className="conta-title">
                  {conta.descricao}
                </strong>

                <span className="conta-valor">
                  {formatMoney(conta.valor)}
                </span>
              </div>

              <div className="conta-bottom">
                <span className="muted">
                  {formatDate(conta.vencimento)}
                </span>

                {conta.repetir && (
                  <span className="badge-recorrente">
                    Recorrente
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="conta-detalhes">
          {!selecionada ? (
            <div className="empty-state">
              Selecione uma conta
            </div>
          ) : (
            <>
              <div className="detalhes-header">
                <div>
                  <h2 className='infos'>{selecionada.descricao}</h2>
                  <span className="muted">
                    {selecionada.categoria || 'Sem categoria'}
                  </span>
                </div>

                <span className="valor-destaque">
                  {formatMoney(selecionada.valor)}
                </span>
              </div>

              <div className="detalhes-body">
                <div>
                  <span className="label">Vencimento</span>
                  <p>{formatDate(selecionada.vencimento)}</p>
                </div>

                <div>
                  <span className="label">Status</span>
                  <p className={selecionada.pago ? 'verde' : 'vermelho'}>
                    {selecionada.pago ? 'Conta paga' : 'Conta pendente'}
                  </p>
                </div>

                {selecionada.pagoEm && (
                  <div>
                    <span className="label">Pago em</span>
                    <p>{formatDate(selecionada.pagoEm)}</p>
                  </div>
                )}

                {selecionada.repetir && (
                  <>
                    <div>
                      <span className="label">Parcelas</span>
                      <p>{selecionada.quantidadeMeses} meses</p>
                    </div>

                 
                  </>
                )}

                <div>
                  <span className="label">Descrição detalhada</span>
                  <p className="descricao">
                    {selecionada.descricaoDetalhada ||
                      'Nenhuma descrição adicionada.'}
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}