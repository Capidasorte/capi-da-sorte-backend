// ROTAS DE COMPRA — BACKEND CAPI DA SORTE
const router = require('express').Router()
const auth = require('../middlewares/auth')
const { purchase, myNumbers, campanhaAtiva, iniciarCompra, statusPagamento } = require('../controllers/purchase.controller')
const { validate, purchaseSchema } = require('../utils/validators')

router.get('/campanha-ativa', campanhaAtiva)
router.post('/iniciar', auth, iniciarCompra)
router.get('/status/:payment_id', auth, statusPagamento)
router.post('/', auth, validate(purchaseSchema), purchase)
router.get('/meus-numeros', auth, myNumbers)

module.exports = router