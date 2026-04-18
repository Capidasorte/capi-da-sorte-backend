const { z } = require('zod')

function validarCPF(cpf) {
  cpf = cpf.replace(/\D/g, '')
  if (cpf.length !== 11) return false
  if (/^(\d)\1+$/.test(cpf)) return false
  let soma = 0
  for (let i = 0; i < 9; i++) soma += parseInt(cpf[i]) * (10 - i)
  let resto = (soma * 10) % 11
  if (resto === 10 || resto === 11) resto = 0
  if (resto !== parseInt(cpf[9])) return false
  soma = 0
  for (let i = 0; i < 10; i++) soma += parseInt(cpf[i]) * (11 - i)
  resto = (soma * 10) % 11
  if (resto === 10 || resto === 11) resto = 0
  if (resto !== parseInt(cpf[10])) return false
  return true
}

function validarMaioridade(dataNascimento) {
  const hoje = new Date()
  const nascimento = new Date(dataNascimento)
  const idade = hoje.getFullYear() - nascimento.getFullYear()
  const mes = hoje.getMonth() - nascimento.getMonth()
  if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
    return idade - 1 >= 18
  }
  return idade >= 18
}

const registerSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter no minimo 3 caracteres'),
  email: z.string().email('Email invalido'),
  senha: z.string().min(6, 'Senha deve ter no minimo 6 caracteres'),
  cpf: z.string().min(11, 'CPF invalido').max(11, 'CPF invalido'),
  telefone: z.string().min(10, 'Telefone invalido'),
  data_nascimento: z.string().min(1, 'Data de nascimento obrigatoria'),
  accepted_terms: z.boolean()
})

const loginSchema = z.object({
  email: z.string().email('Email invalido'),
  senha: z.string().min(1, 'Senha obrigatoria')
})

const purchaseSchema = z.object({
  campaign_id: z.string().uuid('ID de campanha invalido'),
  quantidade: z.number().int().min(1, 'Quantidade minima e 1').max(50, 'Quantidade maxima e 50')
})

const campaignSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter no minimo 3 caracteres'),
  descricao: z.string().optional(),
  total_cotas: z.number().int().min(1000, 'Minimo de 1000 bilhetes'),
  valor_cota: z.number().min(1, 'Valor minimo e R$ 1,00'),
  percentual_premio: z.number().min(1).max(100, 'Percentual invalido'),
  premio_inicial: z.number().min(0).optional(),
  incremento_por_cota: z.number().min(0).optional(),
  limite_cotas_por_cpf: z.number().int().min(1).optional(),
  tempo_reserva_minutos: z.number().int().min(1).max(60).optional()
})

function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body)
    if (!result.success) {
      return res.status(400).json({
        error: 'Dados invalidos',
        detalhes: result.error.errors.map(e => ({
          campo: e.path.join('.'),
          mensagem: e.message
        }))
      })
    }
    next()
  }
}

module.exports = { validate, registerSchema, loginSchema, purchaseSchema, campaignSchema, validarCPF, validarMaioridade }