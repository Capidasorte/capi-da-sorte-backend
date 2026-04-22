// CONTROLLER DE COMPRA — BACKEND CAPI DA SORTE
const db = require('../config/db')
const { getOrCreateCustomer, createPixCharge } = require('../services/asaas.service')
const { validarMaioridade } = require('../utils/validators')
const { log } = require('../utils/logger')

// TABELA DE PACOTES COM DESCONTO
const PACOTES = {
  1:  { valor: 4.99 },
  5:  { valor: 22.00 },
  10: { valor: 40.00 },
  20: { valor: 70.00 },
}

function calcularValor(quantidade) {
  // Verifica se é um pacote exato com desconto
  if (PACOTES[quantidade]) return PACOTES[quantidade].valor
  // Se não for pacote exato, calcula pelo valor unitário
  return parseFloat((quantidade * 4.99).toFixed(2))
}

exports.campanhaAtiva = async (req, res) => {
  try {
    const result = await db.query(
      "SELECT id, nome, total_cotas, valor_cota, premio_inicial, incremento_por_cota, cotas_vendidas, status FROM campaigns WHERE status='active' ORDER BY created_at DESC LIMIT 1"
    )
    if (!result.rows.length) {
      return res.status(404).json({ error: 'Nenhuma campanha ativa' })
    }
    res.json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

exports.iniciarCompra = async (req, res) => {
  try {
    const { campaign_id, quantidade } = req.body
    const user_id = req.user.id

    if (!quantidade || quantidade < 1 || quantidade > 1000) {
      return res.status(400).json({ error: 'Quantidade inválida' })
    }

    const user = await db.query('SELECT * FROM users WHERE id=$1', [user_id])
    if (!user.rows.length) return res.status(400).json({ error: 'Usuario nao encontrado' })

    const campaign = await db.query(
      "SELECT * FROM campaigns WHERE id=$1 AND status='active'",
      [campaign_id]
    )
    if (!campaign.rows.length) return res.status(400).json({ error: 'Campanha nao encontrada' })

    const camp = campaign.rows[0]

    // Verificar limite por CPF
    const comprasUser = await db.query(
      "SELECT COALESCE(SUM(quantidade_cotas),0) as total FROM transactions WHERE campaign_id=$1 AND user_id=$2 AND status='confirmed'",
      [campaign_id, user_id]
    )
    const totalComprado = parseInt(comprasUser.rows[0].total)
    if (totalComprado + quantidade > camp.limite_cotas_por_cpf) {
      return res.status(400).json({ error: `Limite de ${camp.limite_cotas_por_cpf} bilhetes por CPF atingido` })
    }

    // Calcular valor com desconto do pacote
    const valor = calcularValor(quantidade)

    const transaction = await db.query(
      "INSERT INTO transactions(user_id, campaign_id, quantidade_cotas, valor, status, expires_at) VALUES($1,$2,$3,$4,'pending', NOW() + ($5 || ' minutes')::interval) RETURNING *",
      [user_id, campaign_id, quantidade, valor, camp.tempo_reserva_minutos]
    )

    const transaction_id = transaction.rows[0].id
    const userData = user.rows[0]

    const customerId = await getOrCreateCustomer(userData)
    const pix = await createPixCharge(
      customerId,
      valor,
      `Capi da Sorte - ${quantidade} bilhete${quantidade > 1 ? 's' : ''}`
    )

    await db.query(
      'UPDATE transactions SET asaas_payment_id=$1, asaas_customer_id=$2, pix_qr_code=$3, pix_copy_paste=$4 WHERE id=$5',
      [pix.payment_id, customerId, pix.qr_code, pix.copy_paste, transaction_id]
    )

    await log('compra_iniciada', user_id, req.ip, { campaign_id, quantidade, valor })

    res.json({
      transaction_id,
      payment_id: pix.payment_id,
      qr_code_image: pix.qr_code,
      pix_copia_cola: pix.copy_paste,
      valor,
      quantidade
    })

  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

exports.statusPagamento = async (req, res) => {
  try {
    const { payment_id } = req.params
    const result = await db.query(
      "SELECT status FROM transactions WHERE asaas_payment_id=$1",
      [payment_id]
    )
    if (!result.rows.length) return res.status(404).json({ error: 'Pagamento nao encontrado' })
    res.json({ status: result.rows[0].status })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

exports.purchase = async (req, res) => {
  try {
    const { campaign_id, quantidade } = req.body
    const user_id = req.user.id

    const user = await db.query('SELECT * FROM users WHERE id=$1', [user_id])
    if (!user.rows.length) return res.status(400).json({ error: 'Usuario nao encontrado' })

    const userData = user.rows[0]
    if (userData.data_nascimento && !validarMaioridade(userData.data_nascimento)) {
      return res.status(400).json({ error: 'Apenas maiores de 18 anos podem participar' })
    }

    const campaign = await db.query(
      "SELECT * FROM campaigns WHERE id=$1 AND status='active'",
      [campaign_id]
    )
    if (!campaign.rows.length) return res.status(400).json({ error: 'Campanha nao encontrada' })

    const camp = campaign.rows[0]
    if (camp.fechada_em) return res.status(400).json({ error: 'Campanha encerrada para sorteio' })
    if (camp.cotas_vendidas >= camp.total_cotas) return res.status(400).json({ error: 'Campanha esgotada' })

    const valor = calcularValor(quantidade)

    const transaction = await db.query(
      "INSERT INTO transactions(user_id, campaign_id, quantidade_cotas, valor, status, expires_at) VALUES($1,$2,$3,$4,'pending', NOW() + ($5 || ' minutes')::interval) RETURNING *",
      [user_id, campaign_id, quantidade, valor, camp.tempo_reserva_minutos]
    )

    const transaction_id = transaction.rows[0].id
    const customerId = await getOrCreateCustomer(userData)
    const pix = await createPixCharge(customerId, valor, `Capi da Sorte - ${quantidade} bilhete${quantidade > 1 ? 's' : ''}`)

    await db.query(
      'UPDATE transactions SET asaas_payment_id=$1, asaas_customer_id=$2, pix_qr_code=$3, pix_copy_paste=$4 WHERE id=$5',
      [pix.payment_id, customerId, pix.qr_code, pix.copy_paste, transaction_id]
    )

    await log('compra_iniciada', user_id, req.ip, { campaign_id, quantidade, valor })

    res.json({
      transaction_id,
      bilhetes: [],
      valor,
      pix: {
        qr_code: pix.qr_code,
        copy_paste: pix.copy_paste
      }
    })

  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

exports.myNumbers = async (req, res) => {
  try {
    const user_id = req.user.id
    const result = await db.query(
      `SELECT n.numero, n.status, c.nome as campanha, n.created_at
       FROM numbers n
       JOIN campaigns c ON c.id = n.campaign_id
       WHERE n.user_id = $1
       ORDER BY n.created_at DESC`,
      [user_id]
    )
    res.json({ bilhetes: result.rows })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}