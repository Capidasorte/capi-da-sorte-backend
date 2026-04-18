const redis = require('../config/redis')
const db = require('../config/db')

const TTL = {
  campanha: 30,
  ranking: 60,
  stats: 15,
  premio: 10
}

async function getCampanhaAtiva() {
  try {
    const cached = await redis.get('campanha:ativa')
    if (cached) return cached

    const result = await db.query(
      "SELECT * FROM campaigns WHERE status='active' ORDER BY created_at DESC LIMIT 1"
    )

    if (!result.rows.length) return null

    await redis.set('campanha:ativa', result.rows[0], { ex: TTL.campanha })
    return result.rows[0]

  } catch (err) {
    console.error('Cache erro:', err.message)
    const result = await db.query(
      "SELECT * FROM campaigns WHERE status='active' ORDER BY created_at DESC LIMIT 1"
    )
    return result.rows[0] || null
  }
}

async function invalidarCampanha() {
  try {
    await redis.del('campanha:ativa')
    await redis.del('stats:dashboard')
  } catch (err) {
    console.error('Erro ao invalidar cache:', err.message)
  }
}

async function getPremioAtual(campaign_id) {
  try {
    const cached = await redis.get('premio:' + campaign_id)
    if (cached) return parseFloat(cached)

    const result = await db.query(
      'SELECT premio_atual FROM campaigns WHERE id=$1',
      [campaign_id]
    )

    if (!result.rows.length) return 0

    const premio = result.rows[0].premio_atual
    await redis.set('premio:' + campaign_id, premio, { ex: TTL.premio })
    return parseFloat(premio)

  } catch (err) {
    console.error('Cache premio erro:', err.message)
    const result = await db.query(
      'SELECT premio_atual FROM campaigns WHERE id=$1',
      [campaign_id]
    )
    return result.rows.length ? parseFloat(result.rows[0].premio_atual) : 0
  }
}

async function atualizarPremioCache(campaign_id, novoPremio) {
  try {
    await redis.set('premio:' + campaign_id, novoPremio, { ex: TTL.premio })
  } catch (err) {
    console.error('Erro ao atualizar premio no cache:', err.message)
  }
}

async function getStats() {
  try {
    const cached = await redis.get('stats:dashboard')
    if (cached) return cached

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

    const stats = {
      revenue: revenue.rows[0].total,
      bilhetes_vendidos: cotas.rows[0].total,
      usuarios: usuarios.rows[0].total,
      premio: premio.rows[0].total
    }

    await redis.set('stats:dashboard', stats, { ex: TTL.stats })
    return stats

  } catch (err) {
    console.error('Erro no cache de stats:', err.message)
    return null
  }
}

async function getRanking(campaign_id) {
  try {
    const cached = await redis.get('ranking:' + campaign_id)
    if (cached) return cached

    const result = await db.query(
      `SELECT u.nome, u.id, COUNT(n.id) as total_bilhetes
       FROM numbers n
       JOIN users u ON u.id = n.user_id
       WHERE n.campaign_id=$1 AND n.status='vendido'
       GROUP BY u.id, u.nome
       ORDER BY total_bilhetes DESC
       LIMIT 10`,
      [campaign_id]
    )

    await redis.set('ranking:' + campaign_id, result.rows, { ex: TTL.ranking })
    return result.rows

  } catch (err) {
    console.error('Erro no cache de ranking:', err.message)
    return []
  }
}

module.exports = {
  getCampanhaAtiva,
  invalidarCampanha,
  getPremioAtual,
  atualizarPremioCache,
  getStats,
  getRanking
}