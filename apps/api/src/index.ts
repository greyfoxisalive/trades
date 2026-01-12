import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
import passport from 'passport'
import session from 'express-session'
import './config/passport.js'
import { authRoutes } from './routes/auth.js'
import { inventoryRoutes } from './routes/inventory.js'
import { tradeOffersRoutes } from './routes/tradeOffers.js'
import { usersRoutes } from './routes/users.js'
import { Request, Response, NextFunction } from 'express'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}))
app.use(express.json())
app.use(cookieParser())

// Request logging middleware (after body parsing)
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now()
  const timestamp = new Date().toISOString()
  
  // Скрываем чувствительные заголовки
  const sensitiveHeaders = ['authorization', 'cookie', 'x-api-key']
  const sanitizedHeaders = { ...req.headers }
  sensitiveHeaders.forEach(header => {
    if (sanitizedHeaders[header]) {
      sanitizedHeaders[header] = '[REDACTED]'
    }
  })
  
  // Ограничиваем размер тела для логирования (макс 1000 символов)
  const MAX_BODY_LENGTH = 1000
  let bodyPreview = ''
  if (req.body && Object.keys(req.body).length > 0) {
    const bodyStr = JSON.stringify(req.body)
    bodyPreview = bodyStr.length > MAX_BODY_LENGTH 
      ? bodyStr.substring(0, MAX_BODY_LENGTH) + '... [truncated]'
      : bodyStr
  }
  
  res.on('finish', () => {
    const duration = Date.now() - start
    const ip = req.ip || req.socket.remoteAddress || 'unknown'
    const method = req.method
    const url = req.originalUrl || req.url
    const statusCode = res.statusCode
    
    console.log(`[${timestamp}] ${method} ${url} ${statusCode} - ${duration}ms - IP: ${ip}`)
    console.log('Headers:', JSON.stringify(sanitizedHeaders, null, 2))
    
    if (Object.keys(req.query).length > 0) {
      console.log('Query:', JSON.stringify(req.query, null, 2))
    }
    
    if (Object.keys(req.params).length > 0) {
      console.log('Params:', JSON.stringify(req.params, null, 2))
    }
    
    if (bodyPreview) {
      console.log('Body:', bodyPreview)
    }
    
    console.log('---')
  })
  
  next()
})
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-session-secret-change-in-production',
  resave: false,
  saveUninitialized: false,
}))
app.use(passport.initialize())
app.use(passport.session())

app.use('/api/auth', authRoutes)
app.use('/api/inventory', inventoryRoutes)
app.use('/api/trade-offers', tradeOffersRoutes)
app.use('/api/users', usersRoutes)

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' })
})

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
