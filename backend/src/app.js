// APP — BACKEND CAPI DA SORTE
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')
const db = require('./config/db')
const authRoutes = require('./routes/auth.routes')
const adminRoutes = require('./routes/admin.routes')
const purchaseRoutes = require('./routes/purchase.routes')
const webhookRoutes = require('./routes/webhook.routes')

const app = express()

app.use(helmet())

// Rate limit geral
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5000,
  message: { error: 'Muitas requisicoes. Tente novamente em 15 minutos.' },
  standardHeaders: true,
  legacyHeaders: false
})
app.use(limiter)

// Rate limit de auth
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 200,
  message: { error: 'Muitas tentativas. Tente novamente em 1 hora.' }
})

// Rate limit de compra
const purchaseLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 500,
  message: { error: 'Limite de compras atingido. Tente novamente em 1 hora.' }
})

app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://capi-da-sorte-frontend.vercel.app',
    'https://capidasorte.com.br',
    'https://www.capidasorte.com.br'
  ],
  credentials: true
}))

app.use(express.json())

app.get('/', (req, res) => {
  res.json({ message: 'Capi da Sorte API rodando!' })
})

app.get('/test-db', async (req, res) => {
  try {
    const result = await db.query('SELECT COUNT(*) FROM users')
    res.json({ 
      message: 'Banco de dados conectado!',
      usuarios: result.rows[0].count
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.use('/auth', authLimiter, authRoutes)
app.use('/admin', adminRoutes)
app.use('/purchase', purchaseLimiter, purchaseRoutes)
app.use('/webhook', webhookRoutes)

console.log('Rotas registradas!')

module.exports = app