import axios from 'axios'
import type { SteamInventoryItem } from '@steam-trade/shared'

export interface ISteamInventoryService {
  getInventory(steamId: string, appId?: number, contextId?: number): Promise<SteamInventoryItem[]>
}

export class SteamInventoryService implements ISteamInventoryService {
  /**
   * Валидирует и нормализует Steam ID
   * Steam ID должен быть числовым Steam64 ID (17 цифр)
   */
  private validateAndNormalizeSteamId(steamId: string): string {
    if (!steamId || typeof steamId !== 'string') {
      throw new Error('Steam ID is required and must be a string')
    }
    
    // Удаляем пробелы и проверяем, что это число
    const cleaned = steamId.trim()
    
    if (cleaned === '') {
      throw new Error('Steam ID cannot be empty')
    }
    
    // Проверяем, что Steam ID состоит только из цифр (Steam64 формат)
    if (!/^\d+$/.test(cleaned)) {
      throw new Error(`Invalid Steam ID format: ${cleaned}. Steam ID must be a numeric Steam64 ID (17 digits)`)
    }
    
    // Steam64 ID должен быть 17 цифр
    if (cleaned.length !== 17) {
      throw new Error(`Invalid Steam ID length: ${cleaned.length}. Steam64 ID must be exactly 17 digits`)
    }
    
    return cleaned
  }

  async getInventory(
    steamId: string,
    appId: number = 730,
    contextId: number = 2
  ): Promise<SteamInventoryItem[]> {
    try {
      // Валидация и нормализация Steam ID
      const normalizedSteamId = this.validateAndNormalizeSteamId(steamId)
      
      // Валидация appId и contextId
      if (!Number.isInteger(appId) || appId <= 0) {
        throw new Error(`Invalid appId: ${appId}. appId must be a positive integer`)
      }
      
      if (!Number.isInteger(contextId) || contextId < 0) {
        throw new Error(`Invalid contextId: ${contextId}. contextId must be a non-negative integer`)
      }
      
      const url = `https://steamcommunity.com/inventory/${normalizedSteamId}/${appId}/${contextId}?l=english&count=5000`
      console.log(`Fetching inventory from Steam API: ${url}`)
      
      // Steam API требует браузерный User-Agent, иначе возвращает 400
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/json, text/plain, */*',
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept-Encoding': 'gzip, deflate, br',
          'Referer': `https://steamcommunity.com/profiles/${normalizedSteamId}/inventory/`,
        },
        timeout: 30000, // 30 секунд таймаут
      })

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
    } catch (error: any) {
      console.error('Steam inventory API error:', error)
      
      // Provide more specific error messages
      if (error.response) {
        const status = error.response.status
        const responseData = error.response.data
        
        if (status === 400) {
          // Ошибка 400 может означать неправильный формат Steam ID или параметров
          const errorMessage = responseData?.error || responseData?.message || 'Invalid request to Steam API'
          throw new Error(`Invalid Steam ID or request parameters: ${errorMessage}`)
        }
        if (status === 403) {
          throw new Error('Inventory is private or access denied')
        }
        if (status === 404) {
          throw new Error('User not found or inventory does not exist')
        }
        if (status === 429) {
          throw new Error('Rate limit exceeded. Please try again later')
        }
        throw new Error(`Steam API error: ${status} - ${responseData?.error || responseData?.message || 'Unknown error'}`)
      }
      
      if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
        throw new Error('Steam API is temporarily unavailable')
      }
      
      throw new Error(error.message || 'Failed to fetch inventory from Steam')
    }
  }
}
