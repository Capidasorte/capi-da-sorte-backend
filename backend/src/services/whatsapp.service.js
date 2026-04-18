const axios = require('axios')

const ZAPI_INSTANCE_ID = process.env.ZAPI_INSTANCE_ID
const ZAPI_TOKEN = process.env.ZAPI_TOKEN
const ZAPI_URL = `https://api.z-api.io/instances/${ZAPI_INSTANCE_ID}/token/${ZAPI_TOKEN}`

async function sendMessage(telefone, mensagem) {
  try {
    // Limpar telefone - apenas números
    const numero = telefone.replace(/\D/g, '')
    
    // Adicionar 55 se não tiver
    const numeroFormatado = numero.startsWith('55') ? numero : '55' + numero

    const response = await axios.post(`${ZAPI_URL}/send-text`, {
      phone: numeroFormatado,
      message: mensagem
    })

    console.log('WhatsApp enviado para:', numeroFormatado)
    return response.data

  } catch (err) {
    console.error('Erro ao enviar WhatsApp:', err.message)
    throw err
  }
}

async function sendPurchaseConfirmation(telefone, nome, numeros, campanha) {
  const numerosFormatados = numeros.map(n => 
    String(n).padStart(6, '0')
  ).join(', ')

  const mensagem = 
    `Ola ${nome}!\n\n` +
    `Seu pagamento foi confirmado na ${campanha}.\n\n` +
    `Seus numeros da sorte:\n${numerosFormatados}\n\n` +
    `Boa sorte! A Capi da Sorte agradece sua participacao.`

  return await sendMessage(telefone, mensagem)
}

async function sendWinnerNotification(telefone, nome, numero, premio) {
  const mensagem = 
    `Parabens ${nome}!\n\n` +
    `Voce foi o grande ganhador da Capi da Sorte!\n\n` +
    `Numero sorteado: ${String(numero).padStart(6, '0')}\n` +
    `Premio: R$ ${Number(premio).toFixed(2)}\n\n` +
    `Nossa equipe entrara em contato em breve para combinar a entrega do premio.`

  return await sendMessage(telefone, mensagem)
}

module.exports = { sendMessage, sendPurchaseConfirmation, sendWinnerNotification }