const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const db = require('../config/db')
const { log } = require('../utils/logger')
const { validarCPF, validarMaioridade } = require('../utils/validators')

exports.register = async (req, res) => {
  try {
    const { nome, email, senha, cpf, telefone, data_nascimento, accepted_terms } = req.body

    if (!validarMaioridade(data_nascimento)) {
      return res.status(400).json({ error: 'Apenas maiores de 18 anos podem participar' })
    }

    if (!validarCPF(cpf)) {
      return res.status(400).json({ error: 'CPF invalido' })
    }

    if (!accepted_terms) {
      return res.status(400).json({ error: 'Aceite dos termos obrigatorio' })
    }

    const emailExiste = await db.query('SELECT id FROM users WHERE email=$1', [email])
    if (emailExiste.rows.length > 0) {
      return res.status(400).json({ error: 'Email ja cadastrado' })
    }

    const cpfExiste = await db.query('SELECT id FROM users WHERE cpf=$1', [cpf])
    if (cpfExiste.rows.length > 0) {
      return res.status(400).json({ error: 'CPF ja cadastrado' })
    }

    const senha_hash = await bcrypt.hash(senha, 10)
    const cpf_hash = await bcrypt.hash(cpf, 10)

    const user = await db.query(
      `INSERT INTO users(nome, email, senha_hash, cpf, cpf_hash, telefone, data_nascimento, accepted_terms, accepted_terms_at)
       VALUES($1,$2,$3,$4,$5,$6,$7,true,NOW()) RETURNING id, nome, email, role`,
      [nome, email, senha_hash, cpf, cpf_hash, telefone, data_nascimento]
    )

    const token = jwt.sign(
      { id: user.rows[0].id, role: user.rows[0].role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    await log('cadastro', user.rows[0].id, req.ip, { email, cpf: cpf.substring(0,3) + '***' })

    res.json({ token, user: user.rows[0] })

  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

exports.login = async (req, res) => {
  try {
    const { email, senha } = req.body

    const user = await db.query('SELECT * FROM users WHERE email=$1', [email])

    if (!user.rows.length) {
      await log('login_falhou', null, req.ip, { email })
      return res.status(400).json({ error: 'Usuario nao encontrado' })
    }

    const valid = await bcrypt.compare(senha, user.rows[0].senha_hash)

    if (!valid) {
      await log('login_falhou', user.rows[0].id, req.ip, { email })
      return res.status(400).json({ error: 'Senha invalida' })
    }

    const token = jwt.sign(
      { id: user.rows[0].id, role: user.rows[0].role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    await log('login', user.rows[0].id, req.ip, { email })

    res.json({
      token,
      user: {
        id: user.rows[0].id,
        nome: user.rows[0].nome,
        email: user.rows[0].email,
        role: user.rows[0].role
      }
    })

  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}