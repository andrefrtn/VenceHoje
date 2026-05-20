require("dotenv").config()

const express = require("express")
const cors = require("cors")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")

const { PrismaClient } = require("@prisma/client")

const prisma = new PrismaClient()

const app = express()

app.use(cors())
app.use(express.json())

app.get("/", (req, res) => {
  res.send("API rodando")
})

app.post("/register", async (req, res) => {

  try {

  const {
  name,
  cpf,
  email,
  password,
  phone,
  birthDate
} = req.body


 const cleanCpf = cpf ? cpf.replace(/\D/g, "") : ""
const cleanPhone = phone ? phone.replace(/\D/g, "") : ""

    const userExists = await prisma.user.findUnique({
      where: {
        email
      }
    })

    if (userExists) {
      return res.status(400).json({
        message: "Usuário já existe"
      })
    }

       const cpfExists = await prisma.user.findUnique({
  where: {
    cpf: cleanCpf
  }
})

    if (cpfExists) {
      return res.status(400).json({
        message: "CPF já cadastrado"
      })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

const user = await prisma.user.create({
  data: {
    name,
    cpf: cleanCpf,
    email,
    password: hashedPassword,
    phone: cleanPhone,
    birthDate: birthDate
      ? new Date(birthDate)
      : null
  }
})

    res.status(201).json({
      message: "Conta criada"
    })

  } catch (err) {

    console.log(err)

    res.status(500).json({
      message: "Erro interno"
    })

  }

})

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: "Email e senha obrigatórios" })
    }

    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return res.status(400).json({ message: "Usuário não encontrado" })
    }

    const passwordMatch = await bcrypt.compare(password, user.password)

    if (!passwordMatch) {
      return res.status(401).json({ message: "Senha inválida" })
    }

    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    )

    return res.json({
      token,
      user: {
        id: user.id,
        email: user.email
      }
    })

  } catch (err) {
    console.log(err)
    return res.status(500).json({ message: "Erro interno no servidor" })
  }
})

app.listen(3000, () => {
  console.log("Servidor rodando na porta 3000")
})