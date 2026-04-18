const db = require('../config/db')

async function fecharCampanha(campaign_id) {
  const client = await db.connect()

  try {
    await client.query('BEGIN')

    // Buscar campanha
    const camp = await client.query(
      'SELECT * FROM campaigns WHERE id=$1',
      [campaign_id]
    )

    if (!camp.rows.length) {
      throw new Error('Campanha nao encontrada')
    }

    const campData = camp.rows[0]

    if (campData.fechada_em) {
      throw new Error('Campanha ja foi fechada')
    }

    // Expirar todas as reservas pendentes
    await client.query(
      `UPDATE numbers 
       SET status='disponivel', user_id=NULL, transaction_id=NULL
       WHERE campaign_id=$1 AND status='reservado'`,
      [campaign_id]
    )

    // Expirar transações pendentes
    await client.query(
      `UPDATE transactions 
       SET status='expired' 
       WHERE campaign_id=$1 AND status='pending'`,
      [campaign_id]
    )

    // Buscar lista final de bilhetes vendidos
    const bilhetes = await client.query(
      `SELECT n.numero, n.user_id, u.nome, u.cpf, u.email, u.telefone, n.confirmed_at
       FROM numbers n
       JOIN users u ON u.id = n.user_id
       WHERE n.campaign_id=$1 AND n.status='vendido'
       ORDER BY n.numero ASC`,
      [campaign_id]
    )

    // Criar snapshot imutável
    const snapshot = {
      campaign_id,
      fechado_em: new Date().toISOString(),
      total_cotas: campData.total_cotas,
      cotas_vendidas: campData.cotas_vendidas,
      premio_atual: campData.premio_atual,
      percentual_vendido: campData.percentual_vendido,
      total_bilhetes_validos: bilhetes.rows.length,
      bilhetes: bilhetes.rows
    }

    // Salvar snapshot e fechar campanha
    await client.query(
      `UPDATE campaigns 
       SET status='fechada', fechada_em=NOW(), snapshot=$1
       WHERE id=$2`,
      [JSON.stringify(snapshot), campaign_id]
    )

    await client.query('COMMIT')

    return snapshot

  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
}

async function exportarListaFinal(campaign_id) {
  const camp = await db.query(
    'SELECT * FROM campaigns WHERE id=$1',
    [campaign_id]
  )

  if (!camp.rows.length) {
    throw new Error('Campanha nao encontrada')
  }

  if (!camp.rows[0].fechada_em) {
    throw new Error('Campanha ainda nao foi fechada')
  }

  const bilhetes = await db.query(
    `SELECT n.numero, u.nome, u.cpf, u.telefone, n.confirmed_at
     FROM numbers n
     JOIN users u ON u.id = n.user_id
     WHERE n.campaign_id=$1 AND n.status='vendido'
     ORDER BY n.numero ASC`,
    [campaign_id]
  )

  return {
    campanha: camp.rows[0].nome,
    fechada_em: camp.rows[0].fechada_em,
    total_bilhetes: bilhetes.rows.length,
    premio_final: camp.rows[0].premio_atual,
    bilhetes: bilhetes.rows.map(b => ({
      numero: String(b.numero).padStart(6, '0'),
      nome: b.nome,
      cpf: b.cpf.substring(0, 3) + '***' + b.cpf.substring(9),
      telefone: b.telefone,
      confirmado_em: b.confirmed_at
    }))
  }
}

module.exports = { fecharCampanha, exportarListaFinal }