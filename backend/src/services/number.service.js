const crypto = require('crypto')
const db = require('../config/db')

const MAX_ATTEMPTS = 25

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function isCampaignFull(campaign_id, total_cotas) {
  const result = await db.query(
    'SELECT COUNT(*) FROM numbers WHERE campaign_id = $1',
    [campaign_id]
  )
  return Number(result.rows[0].count) >= Number(total_cotas)
}

async function generateNumber(campaign_id, user_id, transaction_id, total_cotas) {
  const full = await isCampaignFull(campaign_id, Number(total_cotas))
  if (full) {
    throw new Error('Campanha esgotada')
  }

  let attempts = 0

  while (attempts < MAX_ATTEMPTS) {
    const numero = crypto.randomInt(1, Number(total_cotas) + 1)

    try {
      const result = await db.query(
        "INSERT INTO numbers (campaign_id, numero, user_id, transaction_id, status) VALUES ($1, $2, $3, $4, 'reservado') RETURNING numero",
        [campaign_id, numero, user_id, transaction_id]
      )
      return result.rows[0].numero

    } catch (err) {
      if (err.code === '23505') {
        attempts++
        await sleep(attempts * 10)
        continue
      }
      throw err
    }
  }

  return await fallbackSequential(campaign_id, user_id, transaction_id, Number(total_cotas))
}

async function fallbackSequential(campaign_id, user_id, transaction_id, total_cotas) {
  const used = await db.query(
    'SELECT numero FROM numbers WHERE campaign_id = $1 ORDER BY numero ASC LIMIT 10000',
    [campaign_id]
  )

  const usedSet = new Set(used.rows.map(r => r.numero))

  for (let i = 1; i <= Number(total_cotas); i++) {
    if (!usedSet.has(i)) {
      try {
        await db.query(
          "INSERT INTO numbers (campaign_id, numero, user_id, transaction_id, status) VALUES ($1, $2, $3, $4, 'reservado')",
          [campaign_id, i, user_id, transaction_id]
        )
        return i
      } catch (err) {
        if (err.code !== '23505') throw err
      }
    }
  }

  throw new Error('Campanha esgotada')
}

async function generateMultipleNumbers(campaign_id, user_id, transaction_id, quantidade, total_cotas) {
  const numbers = []
  for (let i = 0; i < quantidade; i++) {
    const num = await generateNumber(campaign_id, user_id, transaction_id, Number(total_cotas))
    numbers.push(num)
  }
  return numbers
}

module.exports = { generateMultipleNumbers }