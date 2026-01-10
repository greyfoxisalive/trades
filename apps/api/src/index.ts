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

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}))
app.use(express.json())
app.use(cookieParser())
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
