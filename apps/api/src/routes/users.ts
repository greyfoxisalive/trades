import { Router, type Router as RouterType } from 'express'
import { authApplicationService } from '../infrastructure/di/container.js'
import { SteamId } from '../domain/valueObjects/SteamId.js'
import { UserRepository } from '../infrastructure/repositories/UserRepository.js'

const userRepository = new UserRepository()

export const usersRoutes: RouterType = Router()

usersRoutes.get('/by-steam-id/:steamId', async (req, res) => {
  try {
    const { steamId } = req.params
    const steamIdVO = SteamId.create(steamId)
    const user = await userRepository.findBySteamId(steamIdVO)
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }
    
    res.json({
      id: user.getId().getValue(),
      steamId: user.getSteamId().getValue(),
      username: user.getUsername(),
      avatar: user.getAvatar(),
      createdAt: user.getCreatedAt(),
    })
  } catch (error) {
    console.error('Get user error:', error)
    res.status(500).json({ error: 'Failed to fetch user' })
  }
})
