const router = require('express').Router()
const auth = require('../middlewares/auth')
const admin = require('../middlewares/admin')
const db = require('../config/db')
const { fecharCampanha, exportarListaFinal } = require('../services/campaign.service')
const { getStats, getRanking, invalidarCampanha } = require('../services/cache.service')
const { log } = require('../utils/logger')

router.get('/test', (req, res) => {
  res.json({ message: 'Admin funcionando!' })
})

// Stats do dashboard com cache
router.get('/stats', auth, admin, async (req, res) => {
  try {
    const stats = await getStats()
    if (stats) return res.json(stats)

    const revenue = await db.query(
      "SELECT COALESCE(SUM(valor), 0) as total FROM transactions WHERE status='paid'"
    )
    const cotas = await db.query(
      'SELECT COALESCE(SUM(cotas_vendidas), 0) as total FROM campaigns'
    )
    const usuarios = await db.query(
      'SELECT COUNT(*) as total FROM users'
    )
    const premio = await db.query(
      'SELECT COALESCE(SUM(premio_atual), 0) as total FROM campaigns'
    )

    res.json({
      revenue: revenue.rows[0].total,
      bilhetes_vendidos: cotas.rows[0].total,
      usuarios: usuarios.rows[0].total,
      premio: premio.rows[0].total
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Listar campanhas
router.get('/campaigns', auth, admin, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM campaigns ORDER BY created_at DESC'
    )
    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Criar campanha
router.post('/campaigns', auth, admin, async (req, res) => {
  try {
    const {
      nome, descricao, total_cotas, valor_cota,
      percentual_premio, limite_cotas_por_cpf,
      tempo_reserva_minutos, premio_inicial,
      incremento_por_cota
    } = req.body

    const campaign = await db.query(
      `INSERT INTO campaigns(
        nome, descricao, total_cotas, valor_cota, percentual_premio,
        limite_cotas_por_cpf, tempo_reserva_minutos,
        premio_inicial, premio_atual, incremento_por_cota
      ) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$8,$9) RETURNING *`,
      [
        nome, descricao, total_cotas, valor_cota, percentual_premio,
        limite_cotas_por_cpf || 100, tempo_reserva_minutos || 5,
        premio_inicial || 0, incremento_por_cota || 1.50
      ]
    )

    await invalidarCampanha()
    await log('campanha_criada', req.user.id, req.ip, { nome, total_cotas })

    res.json(campaign.rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Listar usuários
router.get('/users', auth, admin, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT id, nome, email, telefone, role, status, created_at FROM users ORDER BY created_at DESC'
    )
    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Ranking com cache
router.get('/campaigns/:id/ranking', auth, admin, async (req, res) => {
  try {
    const ranking = await getRanking(req.params.id)
    res.json(ranking)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Encerrar campanha
router.patch('/campaigns/:id/close', auth, admin, async (req, res) => {
  try {
    await db.query(
      "UPDATE campaigns SET status='closed' WHERE id=$1",
      [req.params.id]
    )
    await invalidarCampanha()
    await log('campanha_encerrada', req.user.id, req.ip, { campaign_id: req.params.id })
    res.json({ message: 'Campanha encerrada' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Fechar campanha para sorteio
router.post('/campaigns/:id/fechar', auth, admin, async (req, res) => {
  try {
    const snapshot = await fecharCampanha(req.params.id)
    await invalidarCampanha()
    await log('campanha_fechada_sorteio', req.user.id, req.ip, { campaign_id: req.params.id })
    res.json({
      message: 'Campanha fechada para sorteio com sucesso',
      snapshot
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Exportar lista final
router.get('/campaigns/:id/lista-final', auth, admin, async (req, res) => {
  try {
    const lista = await exportarListaFinal(req.params.id)
    res.json(lista)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Logs de auditoria
router.get('/logs', auth, admin, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM logs ORDER BY created_at DESC LIMIT 100'
    )
    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET tema ativo — público (página principal consome)
router.get('/tema-ativo', async (req, res) => {
  try {
    const result = await db.query(
      "SELECT valor FROM configuracoes WHERE chave='tema_ativo' LIMIT 1"
    )
    const tema = result.rows[0]?.valor || 'padrao'
    res.json({ tema })
  } catch (err) {
    res.json({ tema: 'padrao' })
  }
})

// POST salvar tema ativo — somente admin
router.post('/tema-ativo', auth, admin, async (req, res) => {
  try {
    const { tema } = req.body
    await db.query(
      `INSERT INTO configuracoes(chave, valor) VALUES('tema_ativo', $1)
       ON CONFLICT(chave) DO UPDATE SET valor=$1, updated_at=NOW()`,
      [tema]
    )
    await log('tema_aplicado', req.user?.id || 'admin', req.ip, { tema })
    res.json({ message: 'Tema aplicado com sucesso', tema })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET listar transações — admin
router.get('/transacoes', auth, admin, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT t.*, u.nome as user_nome, u.email as user_email
       FROM transactions t
       LEFT JOIN users u ON t.user_id = u.id
       ORDER BY t.created_at DESC LIMIT 200`
    )
    res.json({ transacoes: result.rows })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET listar usuários para o painel admin
router.get('/usuarios', auth, admin, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT id, nome, email, telefone, data_nascimento,
       created_at, ativo, saldo_carteira, total_compras, total_gasto
       FROM users ORDER BY created_at DESC LIMIT 500`
    )
    res.json({ usuarios: result.rows })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router