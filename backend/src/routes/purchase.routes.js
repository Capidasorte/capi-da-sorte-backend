const router = require('express').Router()
const auth = require('../middlewares/auth')
const { purchase, myNumbers } = require('../controllers/purchase.controller')
const { validate, purchaseSchema } = require('../utils/validators')

router.post('/', auth, validate(purchaseSchema), purchase)
router.get('/meus-numeros', auth, myNumbers)

module.exports = router