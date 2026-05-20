import { useState } from 'react'

import '../style/Choose.css'

export default function Choose() {

  const [isRegister, setIsRegister] = useState(false)

  return (

    <div className="choosePage">

      <div className="topSection">

        <div className="formCard">

          <div className="formTop">

            <p className="tag">
              controle financeiro inteligente
            </p>

            <h3>
              {isRegister ? 'Criar conta' : 'Bem-vindo'}
            </h3>

            <p className="formDescription">
              {
                isRegister
                ? 'Crie sua conta gratuitamente.'
                : 'Entre na sua conta.'
              }
            </p>

          </div>

          <form>

            <input
              type="email"
              placeholder="Seu email"
            />

            <input
              type="password"
              placeholder="Sua senha"
            />

            {
              isRegister && (
                <>
                
                  <input
                    type="password"
                    placeholder="Confirmar senha"
                  />

                  <input
                    type="tel"
                    placeholder="Telefone"
                  />

                <input
                type="date"
                min="1940-01-01"
                max={new Date().toISOString().split("T")[0]}
                    />

                </>
              )
            }

            <button
              type="button"
              className="loginBtn"
            >
              {
                isRegister
                ? 'Criar conta'
                : 'Entrar'
              }
            </button>

            <button
              type="button"
              className="registerBtn"
              onClick={() => setIsRegister(!isRegister)}
            >
              {
                isRegister
                ? 'Já tenho conta'
                : 'Criar conta'
              }
            </button>

          </form>

        </div>



        <div className="rightSide">

          <h1 className='title'>
            Nunca mais esqueça
            <span> um pagamento.</span>
          </h1>

          <p className="description">
            Organize contas, assinaturas e parcelas
            em um só lugar.
          </p>


          <div className="chartCard">

            <div className="chartTop">

              <div>

                <p className="small">
                  Contas pagas no prazo
                </p>

                <h2>92%</h2>

              </div>

              <div className="badge">
                +18%
              </div>

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

          <h3>
            Nunca perca um vencimento
          </h3>

          <p>
            Receba alertas antes das suas contas vencerem.
          </p>

        </div>

        <div className="benefitCard">

          <h3>
            Controle suas assinaturas
          </h3>

          <p>
            Saiba exatamente quanto você gasta todo mês.
          </p>

        </div>

        <div className="benefitCard">

          <h3>
            Organização sem planilhas
          </h3>

          <p>
            Visual simples e moderno para acompanhar tudo.
          </p>

        </div>

      </div>

    </div>

  )
}