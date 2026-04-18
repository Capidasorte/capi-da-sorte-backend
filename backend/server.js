require('dotenv').config()
const app = require('./src/app')
const { startExpirationJob } = require('./src/jobs/expiration.job')

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log(`Servidor Capi da Sorte rodando na porta ${PORT}`)
  startExpirationJob()
})