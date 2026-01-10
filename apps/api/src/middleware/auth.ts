import { Request, Response, NextFunction } from 'express'
import { authApplicationService } from '../infrastructure/di/container.js'

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const token = req.cookies?.token || req.headers.authorization?.replace('Bearer ', '')
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' })
    }
    
    const user = await authApplicationService.verifyToken(token)
    ;(req as any).user = {
      id: user.getId().getValue(),
      steamId: user.getSteamId().getValue(),
      username: user.getUsername(),
      avatar: user.getAvatar(),
    }
    next()
  } catch (error) {
    res.status(401).json({ error: 'Unauthorized' })
  }
}
