const db = require('../config/db')
const { generateMultipleNumbers } = require('../services/number.service')
const { getOrCreateCustomer, createPixCharge } = require('../services/asaas.service')
const { validarMaioridade } = require('../utils/validators')
const { log } = require('../utils/logger')

exports.purchase = async (req, res) => {
  try {
    const { campaign_id, quantidade } = req.body
    const user_id = req.user.id

    // Buscar usuário e validar maioridade
    const user = await db.query('SELECT * FROM users WHERE id=$1', [user_id])

    if (!user.rows.length) {
      return res.status(400).json({ error: 'Usuario nao encontrado' })
    }

    const userData = user.rows[0]

    // Validar maioridade na compra
    if (userData.data_nascimento && !validarMaioridade(userData.data_nascimento)) {
      return res.status(400).json({ error: 'Apenas maiores de 18 anos podem participar' })
    }

    // Buscar campanha
    const campaign = await db.query(
      "SELECT * FROM campaigns WHERE id=$1 AND status='active'",
      [campaign_id]
    )

    if (!campaign.rows.length) {
      return res.status(400).json({ error: 'Campanha nao encontrada' })
    }

    const camp = campaign.rows[0]

    // Verificar se campanha está fechada para sorteio
    if (camp.fechada_em) {
      return res.status(400).json({ error: 'Campanha encerrada para sorteio. Acompanhe a live!' })
    }

    // Verificar se campanha esgotou
    if (camp.cotas_vendidas >= camp.total_cotas) {
      return res.status(400).json({ error: 'Campanha esgotada' })
    }

    // Verificar limite por CPF
    const comprasUser = await db.query(
      "SELECT COUNT(*) FROM numbers WHERE campaign_id=$1 AND user_id=$2 AND status='vendido'",
      [campaign_id, user_id]
    )

    if (Number(comprasUser.rows[0].count) + quantidade > camp.limite_cotas_por_cpf) {
      return res.status(400).json({ error: 'Limite de bilhetes por CPF atingido' })
    }

    // Calcular valor
    const valor = Number(camp.valor_cota) * quantidade

    // Criar transação pendente
    const transaction = await db.query(
      "INSERT INTO transactions(user_id, campaign_id, quantidade_cotas, valor, status, expires_at) VALUES($1,$2,$3,$4,'pending', NOW() + ($5 || ' minutes')::interval) RETURNING *",
      [user_id, campaign_id, quantidade, valor, camp.tempo_reserva_minutos]
    )

    const transaction_id = transaction.rows[0].id

    // Gerar números
    const numbers = await generateMultipleNumbers(
      campaign_id, user_id, transaction_id, quantidade, camp.total_cotas
    )

    // Criar customer e PIX no Asaas
    const customerId = await getOrCreateCustomer(userData)
    const pix = await createPixCharge(
      customerId,
      valor,
      'Capi da Sorte - ' + quantidade + ' bilhete(s)'
    )

    // Atualizar transação com dados do PIX
    await db.query(
      'UPDATE transactions SET asaas_payment_id=$1, asaas_customer_id=$2, pix_qr_code=$3, pix_copy_paste=$4 WHERE id=$5',
      [pix.payment_id, customerId, pix.qr_code, pix.copy_paste, transaction_id]
    )

    await log('compra_iniciada', user_id, req.ip, { campaign_id, quantidade, valor })

    res.json({
      transaction_id,
      bilhetes: numbers,
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

    // Retornar como "bilhetes"
    res.json({ bilhetes: result.rows })

  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}