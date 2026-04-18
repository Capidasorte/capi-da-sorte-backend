const db = require('../config/db')
const { sendPurchaseConfirmation } = require('../services/whatsapp.service')
const { log } = require('../utils/logger')

exports.asaasWebhook = async (req, res) => {
  try {
    const { event, payment } = req.body

    res.json({ received: true })

    if (event !== 'PAYMENT_RECEIVED' && event !== 'PAYMENT_CONFIRMED') return

    const asaas_payment_id = payment.id

    const jaProcessado = await db.query(
      "SELECT id FROM transactions WHERE asaas_payment_id=$1 AND status='paid'",
      [asaas_payment_id]
    )
    if (jaProcessado.rows.length > 0) {
      console.log('Webhook duplicado ignorado:', asaas_payment_id)
      return
    }

    const transaction = await db.query(
      "SELECT * FROM transactions WHERE asaas_payment_id=$1 AND status='pending'",
      [asaas_payment_id]
    )
    if (!transaction.rows.length) return

    const tx = transaction.rows[0]
    const client = await db.connect()

    try {
      await client.query('BEGIN')

      await client.query(
        "UPDATE transactions SET status='paid', paid_at=NOW() WHERE id=$1",
        [tx.id]
      )

      await client.query(
        "UPDATE numbers SET status='vendido', confirmed_at=NOW() WHERE transaction_id=$1 AND status='reservado'",
        [tx.id]
      )

      await client.query(
        'UPDATE campaigns SET cotas_vendidas = cotas_vendidas + $1 WHERE id=$2',
        [tx.quantidade_cotas, tx.campaign_id]
      )

      const campResult = await client.query('SELECT * FROM campaigns WHERE id=$1', [tx.campaign_id])
      const camp = campResult.rows[0]
      const incremento = Number(camp.incremento_por_cota) * Number(tx.quantidade_cotas)
      const novoPremio = Number(camp.premio_atual) + incremento
      const novasCotas = Number(camp.cotas_vendidas) + Number(tx.quantidade_cotas)
      const novoPct = (novasCotas / Number(camp.total_cotas)) * 100

      await client.query(
        'UPDATE campaigns SET premio_atual=$1, percentual_vendido=$2 WHERE id=$3',
        [novoPremio, novoPct, tx.campaign_id]
      )

      await client.query(
        'INSERT INTO prize_history(campaign_id, premio_valor) VALUES($1,$2)',
        [tx.campaign_id, novoPremio]
      )

      await client.query(
        'INSERT INTO financial_ledger(transaction_id, campaign_id, type, amount) VALUES($1,$2,$3,$4)',
        [tx.id, tx.campaign_id, 'entrada', tx.valor]
      )

      const premio = Number(tx.valor) * 0.30
      await client.query(
        'INSERT INTO financial_ledger(transaction_id, campaign_id, type, amount) VALUES($1,$2,$3,$4)',
        [tx.id, tx.campaign_id, 'premio', premio]
      )

      await client.query('COMMIT')
      console.log('Pagamento confirmado:', asaas_payment_id)

    } catch (err) {
      await client.query('ROLLBACK')
      console.error('Erro no webhook ROLLBACK:', err.message)
      return
    } finally {
      client.release()
    }

    const user = await db.query('SELECT * FROM users WHERE id=$1', [tx.user_id])
    const numbers = await db.query(
      "SELECT numero FROM numbers WHERE transaction_id=$1 AND status='vendido'",
      [tx.id]
    )
    const campaign = await db.query('SELECT nome FROM campaigns WHERE id=$1', [tx.campaign_id])

    if (user.rows[0].telefone) {
      const numerosArray = numbers.rows.map(r => r.numero)
      await sendPurchaseConfirmation(
        user.rows[0].telefone,
        user.rows[0].nome,
        numerosArray,
        campaign.rows[0].nome
      )
    }

    await log('pagamento_confirmado', tx.user_id, null, {
      asaas_payment_id,
      valor: tx.valor,
      quantidade: tx.quantidade_cotas
    })

  } catch (err) {
    console.error('Erro no webhook:', err.message)
  }
}