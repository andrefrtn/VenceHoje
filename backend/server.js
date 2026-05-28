require("dotenv").config()

const express = require("express")
const cors = require("cors")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")

const { PrismaClient } = require("@prisma/client")

const prisma = new PrismaClient()

async function connectDB() {
  try {
    await prisma.$connect()
    console.log("Banco conectado")
  } catch (err) {
    console.log("Erro banco:", err)
  }
}

connectDB()

const app = express()

app.use(cors({
  origin: "*"
}))

app.use(express.json())

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization
  if (!authHeader) return res.status(401).json({ message: "Token não fornecido" })

  const token = authHeader.split(" ")[1]
  if (!token) return res.status(401).json({ message: "Token inválido" })

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.userId = decoded.id
    next()
  } catch (err) {
    return res.status(401).json({ message: "Token expirado ou inválido" })
  }
}

app.get("/", (req, res) => {
  res.send("API rodando")
})


app.post("/register", async (req, res) => {
  try {
    const { name, cpf, email, password, phone, birthDate } = req.body

    if (!name || !cpf || !email || !password) {
      return res.status(400).json({ message: "Campos obrigatórios" })
    }

    const cleanCpf = cpf.replace(/\D/g, "")
    const cleanPhone = phone?.replace(/\D/g, "") || null

    if (cleanCpf.length !== 11) {
      return res.status(400).json({ message: "CPF inválido" })
    }

    const userExists = await prisma.user.findUnique({ where: { email } })
    if (userExists) return res.status(400).json({ message: "Email já existe" })

    const cpfExists = await prisma.user.findUnique({ where: { cpf: cleanCpf } })
    if (cpfExists) return res.status(400).json({ message: "CPF já existe" })

    const hashedPassword = await bcrypt.hash(password, 10)

    await prisma.user.create({
      data: {
        name,
        cpf: cleanCpf,
        email,
        password: hashedPassword,
        phone: cleanPhone,
        birthDate: birthDate && !isNaN(new Date(birthDate))
          ? new Date(birthDate)
          : null
      }
    })

    return res.status(201).json({ message: "Conta criada" })
  } catch (err) {
    console.log("ERRO REGISTER:", err)
    return res.status(500).json({ message: "Erro interno", error: err.message })
  }
})

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: "Email e senha obrigatórios" })
    }

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) return res.status(400).json({ message: "Usuário não encontrado" })

    const passwordMatch = await bcrypt.compare(password, user.password)
    if (!passwordMatch) return res.status(401).json({ message: "Senha inválida" })

    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    )

    return res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email }
    })
  } catch (err) {
    console.log(err)
    return res.status(500).json({ message: "Erro interno no servidor" })
  }
})


app.get("/contas", authMiddleware, async (req, res) => {
  try {
    const contas = await prisma.conta.findMany({
      where: { userId: req.userId },
      orderBy: { vencimento: "asc" }
    })
    return res.json(contas)
  } catch (err) {
    console.log(err)
    return res.status(500).json({ message: "Erro ao buscar contas" })
  }
})

app.post("/contas", authMiddleware, async (req, res) => {
  try {
    const { descricao, valor, vencimento, categoria } = req.body

    if (!descricao || !valor || !vencimento) {
      return res.status(400).json({ message: "Descrição, valor e vencimento são obrigatórios" })
    }

    const conta = await prisma.conta.create({
      data: {
        userId: req.userId,
        descricao,
        valor: parseFloat(valor),
        vencimento: new Date(vencimento),
        categoria: categoria || null,
        pago: false
      }
    })

    return res.status(201).json(conta)
  } catch (err) {
    console.log(err)
    return res.status(500).json({ message: "Erro ao criar conta" })
  }
})

app.patch("/contas/:id/pagar", authMiddleware, async (req, res) => {
  try {
    const id = parseInt(req.params.id)
    const { pago } = req.body

    const conta = await prisma.conta.findFirst({
      where: { id, userId: req.userId }
    })

    if (!conta) return res.status(404).json({ message: "Conta não encontrada" })

    const updated = await prisma.conta.update({
      where: { id },
      data: {
        pago: !!pago,
        pagoEm: pago ? new Date() : null
      }
    })

    return res.json(updated)
  } catch (err) {
    console.log(err)
    return res.status(500).json({ message: "Erro ao atualizar conta" })
  }
})

app.delete("/contas/:id", authMiddleware, async (req, res) => {
  try {
    const id = parseInt(req.params.id)

    const conta = await prisma.conta.findFirst({
      where: { id, userId: req.userId }
    })

    if (!conta) return res.status(404).json({ message: "Conta não encontrada" })

    await prisma.conta.delete({ where: { id } })

    return res.json({ message: "Conta removida" })
  } catch (err) {
    console.log(err)
    return res.status(500).json({ message: "Erro ao deletar conta" })
  }
})


app.get("/myinfos", authMiddleware, async (req, res) => {
  try {
    const infos = await prisma.userInfo.findUnique({
      where: {
        userId: req.userId
      }
    })

    return res.json(infos)
  } catch (err) {
    console.log(err)
    return res.status(500).json({
      message: "Erro ao buscar informações"
    })
  }
})

app.post("/myinfos", authMiddleware, async (req, res) => {
  try {
  const {
    salario,
    rendaExtra,
    gastosFixos,
    gastosVariaveis,
    aluguel,
    financiamento,
    cartao,
    dependentes,
    objetivo,
    reserva,
    investimentos,
    dividas
  } = req.body

    const existing = await prisma.userInfo.findUnique({
      where: {
        userId: req.userId
      }
    })

    if (existing) {
      const updated = await prisma.userInfo.update({
        where: {
          userId: req.userId
        },
        data: {
          salario: salario ? parseFloat(salario) : null,
          rendaExtra: rendaExtra ? parseFloat(rendaExtra) : null,
          gastosFixos: gastosFixos ? parseFloat(gastosFixos) : null,
          gastosVariaveis: gastosVariaveis ? parseFloat(gastosVariaveis) : null,
          aluguel: aluguel ? parseFloat(aluguel) : null,
          financiamento: financiamento ? parseFloat(financiamento) : null,
          cartao: cartao ? parseFloat(cartao) : null,
          dependentes: dependentes ? parseInt(dependentes) : 0,
          objetivo,
          reserva,
          investimentos,
          dividas: dividas ? parseFloat(dividas) : null,
        }
      })

      return res.json(updated)
    }

    const created = await prisma.userInfo.create({
      data: {
        userId: req.userId,

        salario: salario ? parseFloat(salario) : null,
        rendaExtra: rendaExtra ? parseFloat(rendaExtra) : null,
        gastosFixos: gastosFixos ? parseFloat(gastosFixos) : null,
        gastosVariaveis: gastosVariaveis ? parseFloat(gastosVariaveis) : null,
        aluguel: aluguel ? parseFloat(aluguel) : null,
        financiamento: financiamento ? parseFloat(financiamento) : null,
        cartao: cartao ? parseFloat(cartao) : null,

        dependentes: dependentes ? parseInt(dependentes) : 0,

        objetivo,
        reserva,

        investimentos,
        dividas: dividas ? parseFloat(dividas) : null,
      }
    })

    return res.status(201).json(created)

  } catch (err) {
    console.log(err)

    return res.status(500).json({
      message: "Erro ao salvar informações"
    })
  }
})

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`)
})