import axios from 'axios'
import type { User, TradeOffer, CreateTradeOfferRequest, SteamInventoryItem } from '@steam-trade/shared'

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
})

export const authApi = {
  login: () => {
    window.location.href = '/api/auth/steam'
  },
  me: async (): Promise<User> => {
    try {
      const { data } = await api.get('/auth/me')
      return data
    } catch (error: any) {
      // При ошибке 401 выбрасываем ошибку, чтобы React Query правильно обработал её
      if (error.response?.status === 401) {
        throw new Error('Unauthorized')
      }
      throw error
    }
  },
}

export const inventoryApi = {
  getInventory: async (steamId: string): Promise<SteamInventoryItem[]> => {
    try {
      if (!steamId || steamId.trim() === '') {
        throw new Error('Steam ID is required')
      }
      
      // Валидация Steam ID (должен быть 17 цифр)
      const cleanedSteamId = steamId.trim()
      if (!/^\d{17}$/.test(cleanedSteamId)) {
        throw new Error(`Invalid Steam ID format: ${cleanedSteamId}. Steam ID must be a 17-digit Steam64 ID`)
      }
      
      // Пробуем запрос напрямую к Steam API с фронтенда
      // Это работает, потому что запрос идет из браузера пользователя с его cookies
      const url = `https://steamcommunity.com/inventory/${cleanedSteamId}/730/2?l=english&count=5000`
      
      console.log(`Fetching inventory from Steam API (frontend): ${url}`)
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Accept-Language': 'en-US,en;q=0.9',
        },
        credentials: 'include', // Включаем cookies для доступа к Steam
      })
      
      if (!response.ok) {
        if (response.status === 400) {
          const errorData = await response.text()
          console.error('Steam API 400 error:', errorData)
          throw new Error('Steam API returned 400 Bad Request. Please check that your inventory is set to public in Steam privacy settings.')
        }
        if (response.status === 403) {
          throw new Error('Inventory is private or access denied')
        }
        if (response.status === 404) {
          throw new Error('User not found or inventory does not exist')
        }
        throw new Error(`Steam API error: ${response.status} ${response.statusText}`)
      }
      
      const data = await response.json()
      
      // Проверяем структуру ответа
      if (!data || !data.assets || !data.descriptions) {
        console.warn('Steam API returned empty inventory or invalid structure:', data)
        return []
      }
      
      const assets = data.assets as any[]
      const descriptions = data.descriptions as any[]
      
      // Создаем карту описаний для быстрого поиска
      const descriptionMap = new Map()
      descriptions.forEach((desc: any) => {
        descriptionMap.set(`${desc.classid}_${desc.instanceid}`, desc)
      })
      
      // Преобразуем в формат SteamInventoryItem
      const items: SteamInventoryItem[] = assets.map((asset: any) => {
        const desc = descriptionMap.get(`${asset.classid}_${asset.instanceid}`)
        return {
          assetid: asset.assetid,
          classid: asset.classid,
          instanceid: asset.instanceid,
          amount: asset.amount || '1',
          appid: asset.appid || 730,
          contextid: asset.contextid || '2',
          icon_url: desc?.icon_url,
          icon_url_large: desc?.icon_url_large,
          name: desc?.name,
          market_hash_name: desc?.market_hash_name,
          tradable: desc?.tradable,
          marketable: desc?.marketable,
        }
      })
      
      // Фильтруем только tradable предметы
      return items.filter(item => item.tradable === 1)
    } catch (error: any) {
      // Если прямой запрос не работает (CORS), пробуем через бэкенд как fallback
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        console.warn('Direct Steam API request failed, trying backend:', error)
        try {
          const { data } = await api.get(`/inventory/${steamId}`)
          return data
        } catch (backendError: any) {
          if (backendError.response?.status === 400) {
            const errorMessage = backendError.response?.data?.error || 'Invalid Steam ID format'
            throw new Error(errorMessage)
          }
          if (backendError.response?.status === 401) {
            throw new Error('Unauthorized: Please log in to view inventory')
          }
          if (backendError.response?.status === 404) {
            throw new Error('User not found or inventory is private')
          }
          if (backendError.response?.status === 500) {
            const errorMessage = backendError.response?.data?.error || 'Failed to fetch inventory from Steam'
            throw new Error(errorMessage)
          }
          throw backendError
        }
      }
      
      // Пробрасываем оригинальную ошибку
      throw error
    }
  },
}

export const usersApi = {
  getBySteamId: async (steamId: string): Promise<User> => {
    const { data } = await api.get(`/users/by-steam-id/${steamId}`)
    return data
  },
}

export const tradeOffersApi = {
  create: async (tradeOffer: CreateTradeOfferRequest): Promise<TradeOffer> => {
    const { data } = await api.post('/trade-offers', tradeOffer)
    return data
  },
  getAll: async (): Promise<TradeOffer[]> => {
    const { data } = await api.get('/trade-offers')
    return data
  },
  getById: async (id: string): Promise<TradeOffer> => {
    const { data } = await api.get(`/trade-offers/${id}`)
    return data
  },
  accept: async (id: string): Promise<TradeOffer> => {
    const { data } = await api.put(`/trade-offers/${id}/accept`)
    return data
  },
  decline: async (id: string): Promise<TradeOffer> => {
    const { data } = await api.put(`/trade-offers/${id}/decline`)
    return data
  },
}
