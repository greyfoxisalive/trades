import { ISteamInventoryService } from '../../domain/services/SteamInventoryService.js'
import type { SteamInventoryItem } from '@steam-trade/shared'

export class InventoryApplicationService {
  constructor(private readonly steamInventoryService: ISteamInventoryService) {}

  async getInventory(steamId: string, appId?: number, contextId?: number): Promise<SteamInventoryItem[]> {
    return await this.steamInventoryService.getInventory(steamId, appId, contextId)
  }
}
