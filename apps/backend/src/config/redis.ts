import { createClient } from 'redis'

const redisClient: any = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
})

redisClient.connect().catch((err: Error) => {
  console.error('Redis connection error:', err)
})

redisClient.on('error', (err: Error) => {
  console.error('Redis error:', err)
})

redisClient.on('reconnecting', () => {
  console.log('Redis reconnecting...')
})

redisClient.on('connect', () => {
  console.log('Redis connected successfully')
})

export default redisClient
