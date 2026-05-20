import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import '../style/Choose.css'
import axios from "axios"

export default function Choose() {

  const navigate = useNavigate()

  const [isRegister, setIsRegister] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [phone, setPhone] = useState("")
  const [birthDate, setBirthDate] = useState("")
  const [name, setName] = useState("")
  const [cpf, setCpf] = useState("")

  async function handleRegister() {
    if (!name || !cpf || !email || !password) {
      return alert("Preencha todos os campos")
    }

    if (password !== confirmPassword) {
      return alert("As senhas não coincidem")
    }

    try {
      const response = await axios.post("http://localhost:3000/register", {
        name,
        cpf,
        email,
        password,
        phone,
        birthDate
      })

      alert(response.data.message)

    } catch (err) {
      console.log("ERRO COMPLETO:", err)
      console.log("RESPOSTA DO BACKEND:", err.response?.data)
      alert(err.response?.data?.message || "Erro ao criar conta")
    }
  }

  async function handleLogin() {
    try {
      const response = await axios.post("http://localhost:3000/login", {
        email,
        password
      })

      localStorage.setItem("token", response.data.token)
      navigate("/dashboard")

    } catch (err) {
      console.log(err)
      alert("Erro no login")
    }
  }

  function cpfMask(value) {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2")
  }

  function phoneMask(value) {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{5})(\d)/, "$1-$2")
  }

  return (
    <div className="choosePage">

      <div className="topSection">

        <div className="formCard">

          <div className="formTop">
            <p className="tag">controle financeiro inteligente</p>
            <h3>{isRegister ? 'Criar conta' : 'Bem-vindo'}</h3>
            <p className="formDescription">
              {isRegister ? 'Crie sua conta gratuitamente.' : 'Entre na sua conta.'}
            </p>
          </div>

          <form>

            {isRegister && (
              <input
                type="text"
                placeholder="Nome completo"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            )}

            {isRegister && (
              <input
                type="text"
                placeholder="CPF"
                maxLength={14}
                value={cpf}
                onChange={(e) => setCpf(cpfMask(e.target.value))}
              />
            )}

            {isRegister && (
              <input
                type="tel"
                placeholder="Telefone"
                maxLength={15}
                value={phone}
                onChange={(e) => setPhone(phoneMask(e.target.value))}
              />
            )}

            <input
              type="email"
              placeholder="Seu email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              type="password"
              placeholder="Sua senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {isRegister && (
              <>
                <input
                  type="password"
                  placeholder="Confirmar senha"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />

                <input
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  min="1940-01-01"
                  max={new Date().toISOString().split("T")[0]}
                />
              </>
            )}

            <button
              type="button"
              className="loginBtn"
              onClick={isRegister ? handleRegister : handleLogin}
            >
              {isRegister ? "Criar conta" : "Entrar"}
            </button>

            <button
              type="button"
              className="registerBtn"
              onClick={() => setIsRegister(!isRegister)}
            >
              {isRegister ? 'Já tenho conta' : 'Criar conta'}
            </button>

          </form>

        </div>

        <div className="rightSide">

          <h1 className='title'>
            Nunca mais esqueça
            <span> um pagamento.</span>
          </h1>

          <p className="description">
            Organize contas, assinaturas e parcelas em um só lugar.
          </p>

          <div className="chartCard">

            <div className="chartTop">
              <div>
                <p className="small">Contas pagas no prazo</p>
                <h2>92%</h2>
              </div>
              <div className="badge">+18%</div>
            </div>

            <div className="graph">
              <div className="line"></div>
              <div className="bars">
                <div className="bar bar1"></div>
                <div className="bar bar2"></div>
                <div className="bar bar3"></div>
                <div className="bar bar4"></div>
                <div className="bar bar5"></div>
                <div className="bar bar6"></div>
                <div className="bar bar7"></div>
              </div>
            </div>

            <div className="months">
              <span>Jan</span>
              <span>Fev</span>
              <span>Mar</span>
              <span>Abr</span>
              <span>Mai</span>
              <span>Jun</span>
              <span>Jul</span>
            </div>

          </div>

        </div>

      </div>

      <div className="benefits">

        <div className="benefitCard">
          <h3>Nunca perca um vencimento</h3>
          <p>Receba alertas antes das suas contas vencerem.</p>
        </div>

        <div className="benefitCard">
          <h3>Controle suas assinaturas</h3>
          <p>Saiba exatamente quanto você gasta todo mês.</p>
        </div>

        <div className="benefitCard">
          <h3>Organização sem planilhas</h3>
          <p>Visual simples e moderno para acompanhar tudo.</p>
        </div>

      </div>

    </div>
  )
}