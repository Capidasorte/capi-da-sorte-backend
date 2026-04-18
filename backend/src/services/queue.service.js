const { Queue, Worker } = require('bullmq')
const { sendPurchaseConfirmation, sendWinnerNotification, sendMessage } = require('./whatsapp.service')

const connection = {
  host: new URL(process.env.REDIS_URL).hostname,
  port: 6380,
  password: process.env.REDIS_TOKEN,
  tls: {}
}

// FILAS
const whatsappQueue = new Queue('whatsapp', { connection })
const notificationQueue = new Queue('notifications', { connection })

// WORKER WHATSAPP
const whatsappWorker = new Worker('whatsapp', async (job) => {
  const { type, data } = job.data

  if (type === 'purchase_confirmation') {
    await sendPurchaseConfirmation(
      data.telefone,
      data.nome,
      data.numeros,
      data.campanha
    )
  }

  if (type === 'winner_notification') {
    await sendWinnerNotification(
      data.telefone,
      data.nome,
      data.numero,
      data.premio
    )
  }

  if (type === 'campaign_message') {
    await sendMessage(data.telefone, data.mensagem)
  }

  console.log('WhatsApp enviado:', type)

}, {
  connection,
  concurrency: 5,
  limiter: {
    max: 10,
    duration: 1000
  }
})

// WORKER NOTIFICAÇÕES
const notificationWorker = new Worker('notifications', async (job) => {
  const { type, data } = job.data
  console.log('Notificacao processada:', type)
}, {
  connection,
  concurrency: 10
})

whatsappWorker.on('failed', (job, err) => {
  console.error('Falha WhatsApp job:', job.id, err.message)
})

notificationWorker.on('failed', (job, err) => {
  console.error('Falha notificacao:', job.id, err.message)
})

async function queueWhatsapp(type, data) {
  await whatsappQueue.add(type, { type, data }, {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000
    },
    removeOnComplete: 100,
    removeOnFail: 50
  })
}

async function queueNotification(type, data) {
  await notificationQueue.add(type, { type, data }, {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000
    }
  })
}

module.exports = {
  whatsappQueue,
  notificationQueue,
  queueWhatsapp,
  queueNotification
}