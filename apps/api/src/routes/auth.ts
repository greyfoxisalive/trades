import { Router, type Router as RouterType } from 'express'
import passport from 'passport'
import { authApplicationService } from '../infrastructure/di/container.js'

export const authRoutes: RouterType = Router()

authRoutes.get('/steam', passport.authenticate('steam', { failureRedirect: '/' }))

authRoutes.get(
  '/steam/return',
  passport.authenticate('steam', { failureRedirect: '/' }),
  async (req, res) => {
    try {
      const user = await authApplicationService.handleSteamCallback(req.user as any)
      const token = authApplicationService.generateToken(user)
      
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      })
      
      res.redirect(process.env.FRONTEND_URL || 'http://localhost:3000')
    } catch (error) {
      console.error('Auth error:', error)
      res.redirect(process.env.FRONTEND_URL || 'http://localhost:3000')
    }
  }
)

authRoutes.get('/me', async (req, res) => {
  try {
    const token = req.cookies?.token || req.headers.authorization?.replace('Bearer ', '')
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' })
    }
    
    const user = await authApplicationService.verifyToken(token)
    res.json({
      id: user.getId().getValue(),
      steamId: user.getSteamId().getValue(),
      username: user.getUsername(),
      avatar: user.getAvatar(),
      createdAt: user.getCreatedAt(),
    })
  } catch (error) {
    res.status(401).json({ error: 'Unauthorized' })
  }
})

authRoutes.post('/logout', (req, res) => {
  res.clearCookie('token')
  res.json({ message: 'Logged out' })
})
