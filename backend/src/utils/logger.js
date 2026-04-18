const db = require('../config/db')

async function log(acao, user_id, ip, payload) {
  try {
    await db.query(
      'INSERT INTO logs(acao, user_id, ip, payload) VALUES($1,$2,$3,$4)',
      [acao, user_id || null, ip || null, payload ? JSON.stringify(payload) : null]
    )
  } catch (err) {
    console.error('Erro ao registrar log:', err.message)
  }
}

module.exports = { log }