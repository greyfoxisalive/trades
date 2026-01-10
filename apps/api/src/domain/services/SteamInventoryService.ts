import axios from 'axios'
import type { SteamInventoryItem } from '@steam-trade/shared'

export interface ISteamInventoryService {
  getInventory(steamId: string, appId?: number, contextId?: number): Promise<SteamInventoryItem[]>
}

export class SteamInventoryService implements ISteamInventoryService {
  async getInventory(
    steamId: string,
    appId: number = 730,
    contextId: number = 2
  ): Promise<SteamInventoryItem[]> {
    try {
      const url = `https://steamcommunity.com/inventory/${steamId}/${appId}/${contextId}?l=english&count=5000`
      const response = await axios.get(url)

      if (!response.data || !response.data.assets || !response.data.descriptions) {
        return []
      }

      const assets = response.data.assets as any[]
      const descriptions = response.data.descriptions as any[]

      const descriptionMap = new Map()
      descriptions.forEach((desc: any) => {
        descriptionMap.set(`${desc.classid}_${desc.instanceid}`, desc)
      })

      const items: SteamInventoryItem[] = assets.map((asset: any) => {
        const desc = descriptionMap.get(`${asset.classid}_${asset.instanceid}`)
        return {
          assetid: asset.assetid,
          classid: asset.classid,
          instanceid: asset.instanceid,
          amount: asset.amount || '1',
          appid: asset.appid || appId,
          contextid: asset.contextid || contextId.toString(),
          icon_url: desc?.icon_url,
          icon_url_large: desc?.icon_url_large,
          name: desc?.name,
          market_hash_name: desc?.market_hash_name,
          tradable: desc?.tradable,
          marketable: desc?.marketable,
        }
      })

      return items.filter(item => item.tradable === 1)
    } catch (error) {
      console.error('Steam inventory API error:', error)
      throw error
    }
  }
}
