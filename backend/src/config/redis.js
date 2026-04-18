const { Redis } = require('@upstash/redis')

const redis = new Redis({
  url: process.env.REDIS_URL,
  token: process.env.REDIS_TOKEN
})

console.log('Redis Upstash configurado!')

module.exports = redis