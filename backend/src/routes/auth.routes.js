const router = require('express').Router()
const { register, login } = require('../controllers/auth.controller')
const { validate, registerSchema, loginSchema } = require('../utils/validators')

router.post('/register', validate(registerSchema), register)
router.post('/login', validate(loginSchema), login)

module.exports = router