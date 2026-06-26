-- CreateTable
CREATE TABLE "Conta" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "descricao" TEXT NOT NULL,
    "descricaoDetalhada" TEXT,
    "valor" DOUBLE PRECISION NOT NULL,
    "valorOriginal" DOUBLE PRECISION NOT NULL,
    "vencimento" TIMESTAMP(3) NOT NULL,
    "categoria" TEXT,
    "pago" BOOLEAN NOT NULL DEFAULT false,
    "pagoEm" TIMESTAMP(3),
    "repetir" BOOLEAN NOT NULL DEFAULT false,
    "quantidadeMeses" INTEGER DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "grupoRecorrencia" TEXT,
    "numeroParcela" INTEGER,

    CONSTRAINT "Conta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserInfo" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "salario" DOUBLE PRECISION,
    "rendaExtra" DOUBLE PRECISION,
    "gastosFixos" DOUBLE PRECISION,
    "gastosVariaveis" DOUBLE PRECISION,
    "aluguel" DOUBLE PRECISION,
    "financiamento" DOUBLE PRECISION,
    "cartao" DOUBLE PRECISION,
    "dependentes" INTEGER,
    "objetivo" TEXT,
    "reserva" TEXT,
    "investimentos" TEXT,
    "dividas" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserInfo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserInfo_userId_key" ON "UserInfo"("userId");

-- AddForeignKey
ALTER TABLE "Conta" ADD CONSTRAINT "Conta_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserInfo" ADD CONSTRAINT "UserInfo_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
