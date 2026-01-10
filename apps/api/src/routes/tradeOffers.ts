import { Router, type Router as RouterType } from 'express'
import { tradeOfferApplicationService } from '../infrastructure/di/container.js'
import { authMiddleware } from '../middleware/auth.js'

export const tradeOffersRoutes: RouterType = Router()

tradeOffersRoutes.use(authMiddleware)

function mapTradeOfferToDTO(tradeOffer: any) {
  return {
    id: tradeOffer.getId().getValue(),
    fromUserId: tradeOffer.getFromUserId().getValue(),
    toUserId: tradeOffer.getToUserId().getValue(),
    status: tradeOffer.getStatus().toString(),
    itemsFrom: tradeOffer.getItemsFrom().map((item: any) => ({
      id: '',
      tradeOfferId: tradeOffer.getId().getValue(),
      assetId: item.getAssetId(),
      appId: item.getAppId(),
      contextId: item.getContextId(),
      amount: item.getAmount(),
    })),
    itemsTo: tradeOffer.getItemsTo().map((item: any) => ({
      id: '',
      tradeOfferId: tradeOffer.getId().getValue(),
      assetId: item.getAssetId(),
      appId: item.getAppId(),
      contextId: item.getContextId(),
      amount: item.getAmount(),
    })),
    createdAt: tradeOffer.getCreatedAt(),
    updatedAt: tradeOffer.getUpdatedAt(),
  }
}

tradeOffersRoutes.post('/', async (req, res) => {
  try {
    const userId = (req as any).user.id
    const tradeOffer = await tradeOfferApplicationService.createTradeOffer({
      fromUserId: userId,
      ...req.body,
    })
    res.status(201).json(mapTradeOfferToDTO(tradeOffer))
  } catch (error: any) {
    console.error('Create trade offer error:', error)
    const statusCode = error.message.includes('not found') ? 404 : 500
    res.status(statusCode).json({ error: error.message || 'Failed to create trade offer' })
  }
})

tradeOffersRoutes.get('/', async (req, res) => {
  try {
    const userId = (req as any).user.id
    const tradeOffers = await tradeOfferApplicationService.getTradeOffers(userId)
    res.json(tradeOffers.map(to => mapTradeOfferToDTO(to)))
  } catch (error) {
    console.error('Get trade offers error:', error)
    res.status(500).json({ error: 'Failed to fetch trade offers' })
  }
})

tradeOffersRoutes.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const tradeOffer = await tradeOfferApplicationService.getTradeOfferById(id)
    res.json(mapTradeOfferToDTO(tradeOffer))
  } catch (error: any) {
    console.error('Get trade offer error:', error)
    const statusCode = error.message.includes('not found') ? 404 : 500
    res.status(statusCode).json({ error: error.message || 'Failed to fetch trade offer' })
  }
})

tradeOffersRoutes.put('/:id/accept', async (req, res) => {
  try {
    const { id } = req.params
    const userId = (req as any).user.id
    const tradeOffer = await tradeOfferApplicationService.acceptTradeOffer(id, userId)
    res.json(mapTradeOfferToDTO(tradeOffer))
  } catch (error: any) {
    console.error('Accept trade offer error:', error)
    const statusCode = error.message.includes('not found') || error.message.includes('Unauthorized') || error.message.includes('Cannot accept') ? 400 : 500
    res.status(statusCode).json({ error: error.message || 'Failed to accept trade offer' })
  }
})

tradeOffersRoutes.put('/:id/decline', async (req, res) => {
  try {
    const { id } = req.params
    const userId = (req as any).user.id
    const tradeOffer = await tradeOfferApplicationService.declineTradeOffer(id, userId)
    res.json(mapTradeOfferToDTO(tradeOffer))
  } catch (error: any) {
    console.error('Decline trade offer error:', error)
    const statusCode = error.message.includes('not found') || error.message.includes('Unauthorized') || error.message.includes('Cannot decline') ? 400 : 500
    res.status(statusCode).json({ error: error.message || 'Failed to decline trade offer' })
  }
})
