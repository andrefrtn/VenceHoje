import { useEffect, useMemo, useState } from "react"
import "../style/relatorio.css"

const API = import.meta.env.VITE_API_URL || "http://localhost:3000"

function fmt(val) {
  return Number(val || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  })
}

function getMes(dateStr) {
  const d = new Date(dateStr)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
}

function getMesLabel(mesKey) {
  const [ano, mes] = mesKey.split("-")
  const nomes = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"]
  return `${nomes[parseInt(mes) - 1]}/${ano.slice(2)}`
}

function BarChart({ data, color = "#38bdf8" }) {
  if (!data.length) return null

  const max = Math.max(...data.map((d) => d.valor), 1)

  return (
    <div className="relatorio-bar-chart">
      {data.map((d, i) => (
        <div className="relatorio-bar-item" key={i}>
          <div
            className="relatorio-bar"
            title={fmt(d.valor)}
            style={{
              "--bar-color": color,
              "--bar-height": `${Math.max(6, (d.valor / max) * 68)}px`,
            }}
          />
          <span className="relatorio-bar-label">{d.label}</span>
        </div>
      ))}
    </div>
  )
}

function PieChart({ slices }) {
  if (!slices.length) return null

  const total = slices.reduce((s, x) => s + x.valor, 0)
  if (total === 0) return null

  let angle = -Math.PI / 2
  const cx = 80
  const cy = 80
  const r = 70

  const paths = slices.map((s, i) => {
    const frac = s.valor / total
    const sweep = frac * 2 * Math.PI
    const x1 = cx + r * Math.cos(angle)
    const y1 = cy + r * Math.sin(angle)
    angle += sweep
    const x2 = cx + r * Math.cos(angle)
    const y2 = cy + r * Math.sin(angle)
    const large = sweep > Math.PI ? 1 : 0

    return (
      <path
        d={`M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${large},1 ${x2},${y2} Z`}
        fill={s.color}
        key={i}
        opacity={0.88}
      />
    )
  })

  return (
    <svg className="relatorio-pie-chart" viewBox="0 0 160 160" width={140} height={140}>
      {paths}
      <circle cx={cx} cy={cy} r={38} fill="#13161C" />
    </svg>
  )
}

function ScoreRing({ score }) {
  const r = 52
  const circ = 2 * Math.PI * r
  const offset = circ - (score / 100) * circ
const color = score >= 80 ? "#049445" : score >= 60 ? "#14698d" : score >= 40 ? "#fbbf24" : "#941010" 
const label = score >= 80 ? "Excelente" : score >= 60 ? "Boa" : score >= 40 ? "Atencao" : "Critica"

  return (
    <div className="relatorio-score">
      <svg width={128} height={128} viewBox="0 0 128 128">
        <circle cx={64} cy={64} r={r} fill="none" stroke="#252A34" strokeWidth={10} />
        <circle
          cx={64}
          cy={64}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={10}
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 64 64)"
          className="relatorio-score-ring"
        />
        <text x={64} y={60} textAnchor="middle" fill="#fff" fontSize={22} fontWeight={700}>
          {score}
        </text>
        <text x={64} y={78} textAnchor="middle" fill="#8B95A7" fontSize={11}>
          /100
        </text>
      </svg>
      <span className="relatorio-score-label" style={{ "--score-color": color }}>
        {label}
      </span>
    </div>
  )
}

function Card({ label, valor, sub, color = "#38bdf8", icon }) {
  return (
    <div className="relatorio-card" style={{ "--card-color": color }}>
      <span className="relatorio-card-label">
        {icon} {label}
      </span>
      <span className="relatorio-card-value">{valor}</span>
      {sub && <span className="relatorio-card-sub">{sub}</span>}
    </div>
  )
}

function Section({ title, children }) {
  return (
    <section className="relatorio-section">
      <h3 className="relatorio-section-title">{title}</h3>
      {children}
    </section>
  )
}

const CAT_COLORS = [
  "#16264b", 
  "#1e3a8a",
  "#1d4ed8",
  "#2563eb",
  "#3b82f6",
  "#60a5fa",
  "#93c5fd",
  "#bfdbfe",
  "#dbeafe",
  "#eff6ff"
]

export default function Relatorio() {
  const [contas, setContas] = useState([])
  const [infos, setInfos] = useState(null)
  const [loading, setLoading] = useState(true)

  const token = localStorage.getItem("token")

  useEffect(() => {
    async function load() {
      try {
        const [resC, resI] = await Promise.all([
          fetch(`${API}/contas`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API}/myinfos`, { headers: { Authorization: `Bearer ${token}` } }),
        ])
        const c = await resC.json()
        const i = await resI.json()
        setContas(Array.isArray(c) ? c : [])
        setInfos(i || null)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [token])

  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)

  const stats = useMemo(() => {
    const pagas = contas.filter((c) => c.pago)
    const pendentes = contas.filter((c) => !c.pago)
    const vencidas = pendentes.filter((c) => new Date(c.vencimento) < hoje)
    const aVencer = pendentes.filter((c) => new Date(c.vencimento) >= hoje)

    const totalPago = pagas.reduce((s, c) => s + c.valor, 0)
    const totalPendente = pendentes.reduce((s, c) => s + c.valor, 0)
    const totalVencido = vencidas.reduce((s, c) => s + c.valor, 0)

    const taxaPagamento = contas.length > 0 ? Math.round((pagas.length / contas.length) * 100) : 0

    const mesAtual = getMes(new Date())
    const contasMes = contas.filter((c) => getMes(c.vencimento) === mesAtual)
    const porCategoria = {}
    contasMes.forEach((c) => {
      const cat = c.categoria || "Sem categoria"
      porCategoria[cat] = (porCategoria[cat] || 0) + c.valor
    })
    const categorias = Object.entries(porCategoria)
      .sort((a, b) => b[1] - a[1])
      .map(([nome, valor], i) => ({ nome, valor, color: CAT_COLORS[i % CAT_COLORS.length] }))

    const mesesMap = {}
    for (let i = 5; i >= 0; i--) {
      const d = new Date()
      d.setMonth(d.getMonth() - i)
      const k = getMes(d)
      mesesMap[k] = 0
    }
    contas.forEach((c) => {
      const m = getMes(c.vencimento)
      if (m in mesesMap) mesesMap[m] += c.valor
    })
    const evolucao = Object.entries(mesesMap).map(([k, valor]) => ({
      label: getMesLabel(k),
      valor,
    }))

    const rankingMap = {}
    contas.forEach((c) => {
      const rankingKey = c.grupoRecorrencia || `unico-${c.id}`

      if (!rankingMap[rankingKey]) {
        rankingMap[rankingKey] = {
          ...c,
          rankingKey,
          totalValor: 0,
          parcelas: 0,
          valorParcela: c.valor,
        }
      }

      rankingMap[rankingKey].totalValor += c.valor
      rankingMap[rankingKey].parcelas += 1
    })
    const ranking = Object.values(rankingMap)
      .sort((a, b) => b.totalValor - a.totalValor)
      .slice(0, 7)
    const recorrentes = contas.filter((c) => c.repetir).reduce((s, c) => s + c.valor, 0)
    const unicos = contas.filter((c) => !c.repetir).reduce((s, c) => s + c.valor, 0)

    const proximoMes = getMes(new Date(new Date().setMonth(new Date().getMonth() + 1)))
    const projecao = contas
      .filter((c) => c.repetir && getMes(c.vencimento) === proximoMes)
      .sort((a, b) => b.valor - a.valor)
      .slice(0, 6)
    const totalProjecao = projecao.reduce((s, c) => s + c.valor, 0)

    const salario = (infos?.salario || 0) + (infos?.rendaExtra || 0)
    const despesasMensais = contasMes.reduce((s, c) => s + c.valor, 0)
    const comprometimento = salario > 0 ? Math.round((despesasMensais / salario) * 100) : null
    const saldo = salario - despesasMensais

    let score = 100
    if (vencidas.length > 0) score -= Math.min(30, vencidas.length * 5)
    if (infos?.dividas > 0) score -= 15
    if (comprometimento !== null) {
      if (comprometimento > 90) score -= 25
      else if (comprometimento > 70) score -= 15
      else if (comprometimento > 50) score -= 5
    }
    if (taxaPagamento < 80) score -= 10
    if (infos?.reserva) score += 5
    score = Math.max(0, Math.min(100, score))

    let maiorAtraso = 0
    vencidas.forEach((c) => {
      const dias = Math.floor((hoje - new Date(c.vencimento)) / 86400000)
      if (dias > maiorAtraso) maiorAtraso = dias
    })

    const insights = []
    if (comprometimento !== null && comprometimento <= 50) {
      insights.push({ tipo: "ok", msg: `Voce compromete apenas ${comprometimento}% da renda com despesas - excelente controle!` })
    }
    if (comprometimento !== null && comprometimento > 70) {
      insights.push({ tipo: "alerta", msg: `${comprometimento}% da sua renda esta comprometida com despesas. Avalie cortes.` })
    }
    if (categorias[0]) {
      insights.push({
        tipo: "info",
        msg: `Seu maior centro de gastos e ${categorias[0].nome}, representando ${Math.round(
          (categorias[0].valor / (despesasMensais || 1)) * 100,
        )}% das despesas do mes.`,
      })
    }
    if (vencidas.length > 0) {
      insights.push({
        tipo: "alerta",
        msg: `Voce possui ${vencidas.length} conta${vencidas.length > 1 ? "s" : ""} vencida${
          vencidas.length > 1 ? "s" : ""
        } no valor de ${fmt(totalVencido)}.`,
      })
    }
    if (taxaPagamento >= 90) {
      insights.push({ tipo: "ok", msg: `Taxa de pagamento de ${taxaPagamento}% - voce esta em dia com suas obrigacoes.` })
    }
    if (evolucao.length >= 2) {
      const ult = evolucao[evolucao.length - 1].valor
      const ant = evolucao[evolucao.length - 2].valor
      if (ant > 0) {
        const diff = Math.round(((ult - ant) / ant) * 100)
        if (diff < -5) insights.push({ tipo: "ok", msg: `Voce reduziu seus gastos em ${Math.abs(diff)}% em relacao ao mes anterior.` })
        if (diff > 10) insights.push({ tipo: "alerta", msg: `Seus gastos aumentaram ${diff}% em relacao ao mes anterior.` })
      }
    }

    return {
      pagas,
      pendentes,
      vencidas,
      aVencer,
      totalPago,
      totalPendente,
      totalVencido,
      taxaPagamento,
      categorias,
      evolucao,
      ranking,
      recorrentes,
      unicos,
      projecao,
      totalProjecao,
      salario,
      despesasMensais,
      comprometimento,
      saldo,
      score,
      maiorAtraso,
      insights,
    }
  }, [contas, infos])

  function saudeLabel(p) {
    if (p === null) return { label: "-", color: "#8B95A7" }
    if (p <= 50) return { label: "Excelente", color: "#4ade80" }
    if (p <= 70) return { label: "Boa", color: "#38bdf8" }
    if (p <= 90) return { label: "Atencao", color: "#fbbf24" }
    return { label: "Critica", color: "#f87171" }
  }

  const saude = saudeLabel(stats.comprometimento)

  if (loading) {
    return <div className="relatorio-loading">Carregando relatorio...</div>
  }

  return (
    <div className="dash-page relatorio-page">
      <div className="dash-header">
        <div>
          <h1 className="dash-greeting">
            Relatorio <span className="dash-name">Financeiro</span>
          </h1>
          <p className="dash-sub">Visao completa da sua saude financeira</p>
        </div>
      </div>

      <div className="relatorio-cards-grid">
        <Card label="Receita mensal" valor={fmt(stats.salario)} color="#4ade80" icon="$" />
        <Card label="Despesas do mes" valor={fmt(stats.despesasMensais)} color="#f87171" icon="-" />
        <Card
          label="Saldo"
          valor={fmt(stats.saldo)}
          color={stats.saldo >= 0 ? "#4ade80" : "#f87171"}
          icon="="
          sub={stats.comprometimento !== null ? `${stats.comprometimento}% comprometido` : undefined}
        />
        <Card label="Score financeiro" valor={`${stats.score}/100`} color="#38bdf8" icon="*" sub={saude.label} />
      </div>

      <div className="relatorio-three-grid">
        <Section title="Score Financeiro">
          <div className="relatorio-center">
            <ScoreRing score={stats.score} />
          </div>
        </Section>

        <Section title="Saude Financeira">
          {stats.comprometimento === null ? (
            <p className="relatorio-muted-text">Cadastre seu salario em "Meus Dados" para ver a saude financeira.</p>
          ) : (
            <div className="relatorio-stack">
              {[
                { l: "Receita", v: fmt(stats.salario), c: "#4ade80" },
                { l: "Despesas", v: fmt(stats.despesasMensais), c: "#f87171" },
                { l: "Comprometido", v: `${stats.comprometimento}%`, c: saude.color },
              ].map((r) => (
                <div className="relatorio-row" key={r.l}>
                  <span className="relatorio-row-label">{r.l}</span>
                  <span className="relatorio-row-value" style={{ "--row-color": r.c }}>
                    {r.v}
                  </span>
                </div>
              ))}
              <ProgressBar value={stats.comprometimento} color={saude.color} />
              <span className="relatorio-status" style={{ "--status-color": saude.color }}>
                {saude.label}
              </span>
            </div>
          )}
        </Section>

        <Section title="Taxa de Pagamento">
          <div className="relatorio-stack">
            {[
              { l: "Cadastradas", v: contas.length, c: "#fff" },
              { l: "Pagas", v: stats.pagas.length, c: "#4ade80" },
              { l: "Pendentes", v: stats.pendentes.length, c: "#fbbf24" },
              { l: "Vencidas", v: stats.vencidas.length, c: "#f87171" },
            ].map((r) => (
              <div className="relatorio-row" key={r.l}>
                <span className="relatorio-row-label">{r.l}</span>
                <span className="relatorio-row-value" style={{ "--row-color": r.c }}>
                  {r.v}
                </span>
              </div>
            ))}
            <ProgressBar value={stats.taxaPagamento} color="#4ade80" />
            <span className="relatorio-status relatorio-status-ok">{stats.taxaPagamento}% em dia</span>
          </div>
        </Section>
      </div>

      <div className="relatorio-two-grid">
        <Section title="Gastos por Categoria (mes atual)">
          {stats.categorias.length === 0 ? (
            <p className="relatorio-muted-text">Nenhuma conta no mes atual.</p>
          ) : (
            <div className="relatorio-category-layout">
              <PieChart slices={stats.categorias} />
              <div className="relatorio-category-list">
                {stats.categorias.map((c, i) => {
                  const pct = Math.round((c.valor / stats.despesasMensais) * 100)
                  return (
                    <div className="relatorio-category-row" key={i}>
                      <div className="relatorio-color-dot" style={{ "--dot-color": c.color }} />
                      <span className="relatorio-category-name">{c.nome}</span>
                      <span className="relatorio-category-pct">{pct}%</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </Section>

        <Section title="Evolucao dos Gastos (6 meses)">
          {stats.evolucao.every((d) => d.valor === 0) ? (
            <p className="relatorio-muted-text">Sem dados suficientes.</p>
          ) : (
            <BarChart data={stats.evolucao} color="#38bdf8" />
          )}
        </Section>
      </div>

      <div className="relatorio-two-grid">
        <Section title="Recorrentes vs Eventuais">
          <div className="relatorio-stack">
            {[
              { l: "Gastos Recorrentes", v: fmt(stats.recorrentes), c: "#cfdaff" },
              { l: "Gastos Eventuais", v: fmt(stats.unicos), c: "#8b9aca" },
            ].map((r) => (
              <div className="relatorio-row relatorio-row-large" key={r.l}>
                <span className="relatorio-row-label">{r.l}</span>
                <span className="relatorio-row-value" style={{ "--row-color": r.c }}>
                  {r.v}
                </span>
              </div>
            ))}
            {stats.recorrentes + stats.unicos > 0 && <SplitBar recorrentes={stats.recorrentes} unicos={stats.unicos} />}
          </div>
        </Section>

        <Section title="Inadimplencia">
          <div className="relatorio-stack">
            {[
              { l: "Contas vencidas", v: stats.vencidas.length, c: "#f87171" },
              { l: "Valor vencido", v: fmt(stats.totalVencido), c: "#f87171" },
              { l: "Maior atraso", v: stats.maiorAtraso > 0 ? `${stats.maiorAtraso} dias` : "-", c: "#fbbf24" },
            ].map((r) => (
              <div className="relatorio-row relatorio-row-large" key={r.l}>
                <span className="relatorio-row-label">{r.l}</span>
                <span className="relatorio-row-value" style={{ "--row-color": stats.vencidas.length === 0 ? "#4ade80" : r.c }}>
                  {r.v}
                </span>
              </div>
            ))}
            {stats.vencidas.length === 0 && <span className="relatorio-ok-text">Nenhuma conta vencida</span>}
          </div>
        </Section>
      </div>

      <div className="relatorio-block">
        <Section title="Ranking de Maiores Gastos">
          {stats.ranking.length === 0 ? (
            <p className="relatorio-muted-text">Nenhuma conta cadastrada.</p>
          ) : (
            <div className="relatorio-ranking-list">
              {stats.ranking.map((c, i) => {
                const maxVal = stats.ranking[0].totalValor
                const pct = Math.round((c.totalValor / maxVal) * 100)
                return (
                  <div className="relatorio-ranking-row" key={c.rankingKey}>
                    <span className={i < 3 ? "relatorio-rank relatorio-rank-top" : "relatorio-rank"}>{i + 1}</span>
                    <div className="relatorio-ranking-content">
                      <div className="relatorio-ranking-header">
                        <div className="relatorio-ranking-title">
                          <span className="relatorio-ranking-name">{c.descricao}</span>
                          {c.parcelas > 1 && (
                            <span className="relatorio-ranking-badge">
                              {c.parcelas}x {fmt(c.valorParcela)}
                            </span>
                          )}
                        </div>
                        <span className="relatorio-ranking-value">{fmt(c.totalValor)}</span>
                      </div>
                      <div className="relatorio-mini-track">
                        <div
                          className="relatorio-mini-fill"
                          style={{
                            "--mini-color": CAT_COLORS[i % CAT_COLORS.length],
                            "--mini-width": `${pct}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </Section>
      </div>

      <div className="relatorio-block">
        <Section title="Projecao do Proximo Mes">
          {stats.projecao.length === 0 ? (
            <p className="relatorio-muted-text">Nenhuma conta recorrente encontrada para o proximo mes.</p>
          ) : (
            <div className="relatorio-projection-list">
              {stats.projecao.map((c) => (
                <div className="relatorio-projection-row" key={c.id}>
                  <span>{c.descricao}</span>
                  <span>{fmt(c.valor)}</span>
                </div>
              ))}
              <div className="relatorio-projection-total">
                <span>Total previsto</span>
                <span>{fmt(stats.totalProjecao)}</span>
              </div>
            </div>
          )}
        </Section>
      </div>

      <Section title="Insights Automaticos">
        {stats.insights.length === 0 ? (
          <p className="relatorio-muted-text">Adicione mais dados para receber insights personalizados.</p>
        ) : (
          <div className="relatorio-insights">
            {stats.insights.map((ins, i) => {
              const colors = { ok: "#09993e", alerta: "#bd8905", info: "#0579aa" }
              const icons = { ok: "OK", alerta: "!", info: "i" }
              const c = colors[ins.tipo]

              return (
                <div className="relatorio-insight" key={i} style={{ "--insight-color": c }}>
                  <span className="relatorio-insight-icon">{icons[ins.tipo]}</span>
                  <span className="relatorio-insight-text">{ins.msg}</span>
                </div>
              )
            })}
          </div>
        )}
      </Section>
    </div>
  )
}

function ProgressBar({ value, color }) {
  return (
    <div className="relatorio-progress">
      <div
        className="relatorio-progress-fill"
        style={{
          "--progress-color": color,
          "--progress-width": `${Math.min(value, 100)}%`,
        }}
      />
    </div>
  )
}

function SplitBar({ recorrentes, unicos }) {
  return (
    <div className="relatorio-split-bar">
      <div className="relatorio-split-recorrentes" style={{ "--split-flex": recorrentes }} />
      <div className="relatorio-split-unicos" style={{ "--split-flex": unicos }} />
    </div>
  )
}
