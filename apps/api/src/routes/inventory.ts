import { Router, type Router as RouterType } from 'express'
import { inventoryApplicationService } from '../infrastructure/di/container.js'
import { authMiddleware } from '../middleware/auth.js'

export const inventoryRoutes: RouterType = Router()

inventoryRoutes.get('/:steamId', authMiddleware, async (req, res) => {
  try {
    const { steamId } = req.params
    const inventory = await inventoryApplicationService.getInventory(steamId)
    res.json(inventory)
  } catch (error) {
    console.error('Inventory error:', error)
    res.status(500).json({ error: 'Failed to fetch inventory' })
  }
})
