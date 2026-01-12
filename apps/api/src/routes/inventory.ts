import { Router, type Router as RouterType } from 'express'
import { inventoryApplicationService } from '../infrastructure/di/container.js'
import { authMiddleware } from '../middleware/auth.js'

export const inventoryRoutes: RouterType = Router()

inventoryRoutes.get('/:steamId', authMiddleware, async (req, res) => {
  try {
    const { steamId } = req.params
    
    if (!steamId || steamId.trim() === '') {
      return res.status(400).json({ error: 'Steam ID is required' })
    }
    
    const inventory = await inventoryApplicationService.getInventory(steamId)
    res.json(inventory)
  } catch (error: any) {
    console.error('Inventory error:', error)
    
    // Check if it's an axios error from Steam API
    if (error.response) {
      const status = error.response.status
      if (status === 403) {
        return res.status(403).json({ error: 'Inventory is private or access denied' })
      }
      if (status === 404) {
        return res.status(404).json({ error: 'User not found or inventory does not exist' })
      }
      if (status === 429) {
        return res.status(429).json({ error: 'Rate limit exceeded. Please try again later' })
      }
    }
    
    // Check if it's a network error
    if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
      return res.status(503).json({ error: 'Steam API is temporarily unavailable' })
    }
    
    res.status(500).json({ error: error.message || 'Failed to fetch inventory from Steam' })
  }
})
