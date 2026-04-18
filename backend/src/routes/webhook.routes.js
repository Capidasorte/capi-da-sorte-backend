const router = require('express').Router()
const { asaasWebhook } = require('../controllers/webhook.controller')

router.post('/asaas', asaasWebhook)

module.exports = router