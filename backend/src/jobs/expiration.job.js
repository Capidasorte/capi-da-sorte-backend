const db = require('../config/db')

async function expireReservations() {
  try {
    // Buscar transações expiradas
    const expired = await db.query(
      `SELECT id FROM transactions 
       WHERE status='pending' 
       AND expires_at < NOW()`
    )

    if (!expired.rows.length) return

    for (const tx of expired.rows) {
      // Liberar números reservados
      await db.query(
        `UPDATE numbers 
         SET status='disponivel', user_id=NULL, transaction_id=NULL
         WHERE transaction_id=$1 
         AND status='reservado'`,
        [tx.id]
      )

      // Marcar transação como expirada
      await db.query(
        `UPDATE transactions 
         SET status='expired' 
         WHERE id=$1`,
        [tx.id]
      )
    }

    if (expired.rows.length > 0) {
      console.log(`Reservas expiradas: ${expired.rows.length}`)
    }

  } catch (err) {
    console.error('Erro na expiração:', err.message)
  }
}

// Rodar a cada 1 minuto
function startExpirationJob() {
  console.log('Job de expiração iniciado!')
  setInterval(expireReservations, 60 * 1000)
  // Rodar imediatamente na inicialização
  expireReservations()
}

module.exports = { startExpirationJob }