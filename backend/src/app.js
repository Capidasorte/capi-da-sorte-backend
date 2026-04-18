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

// Segurança
app.use(helmet())

// Rate limit geral
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100,
  message: { error: 'Muitas requisicoes. Tente novamente em 15 minutos.' }
})
app.use(limiter)

// Rate limit para auth
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 10,
  message: { error: 'Muitas tentativas. Tente novamente em 1 hora.' }
})

app.use(cors())
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
app.use('/purchase', purchaseRoutes)
app.use('/webhook', webhookRoutes)

console.log('Rotas registradas!')

module.exports = app