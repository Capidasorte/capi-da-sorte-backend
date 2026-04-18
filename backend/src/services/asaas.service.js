const axios = require('axios')

const asaas = axios.create({
  baseURL: process.env.ASAAS_URL,
  headers: {
    'access_token': process.env.ASAAS_API_KEY,
    'Content-Type': 'application/json'
  }
})

async function getOrCreateCustomer(user) {
  try {
    const search = await asaas.get('/customers?cpfCnpj=' + user.cpf)
    if (search.data.data.length > 0) {
      return search.data.data[0].id
    }

    const telefone = user.telefone ? user.telefone.replace(/\D/g, '') : null

    const payload = {
      name: user.nome,
      cpfCnpj: user.cpf,
      email: user.email
    }

    if (telefone && telefone.length >= 10) {
      payload.mobilePhone = telefone
    }

    const customer = await asaas.post('/customers', payload)
    return customer.data.id
  } catch (err) {
    const detail = err.response ? JSON.stringify(err.response.data) : err.message
    throw new Error('Erro ao criar customer: ' + detail)
  }
}

async function createPixCharge(customerId, valor, descricao) {
  try {
    const charge = await asaas.post('/payments', {
      customer: customerId,
      billingType: 'PIX',
      value: valor,
      dueDate: new Date(Date.now() + 30 * 60 * 1000).toISOString().split('T')[0],
      description: descricao
    })
    const pix = await asaas.get('/payments/' + charge.data.id + '/pixQrCode')
    return {
      payment_id: charge.data.id,
      qr_code: pix.data.encodedImage,
      copy_paste: pix.data.payload
    }
  } catch (err) {
    const detail = err.response ? JSON.stringify(err.response.data) : err.message
    throw new Error('Erro ao criar PIX: ' + detail)
  }
}

module.exports = { getOrCreateCustomer, createPixCharge }