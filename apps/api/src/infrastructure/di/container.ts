import { UserRepository } from '../repositories/UserRepository.js'
import { TradeOfferRepository } from '../repositories/TradeOfferRepository.js'
import { SteamInventoryService } from '../../domain/services/SteamInventoryService.js'
import { AuthApplicationService } from '../../application/services/AuthApplicationService.js'
import { TradeOfferApplicationService } from '../../application/services/TradeOfferApplicationService.js'
import { InventoryApplicationService } from '../../application/services/InventoryApplicationService.js'

// Repositories
const userRepository = new UserRepository()
const tradeOfferRepository = new TradeOfferRepository()

// Domain Services
const steamInventoryService = new SteamInventoryService()

// Application Services
export const authApplicationService = new AuthApplicationService(userRepository)
export const tradeOfferApplicationService = new TradeOfferApplicationService(
  tradeOfferRepository,
  userRepository
)
export const inventoryApplicationService = new InventoryApplicationService(steamInventoryService)
