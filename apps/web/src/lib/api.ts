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
      const { data } = await api.get(`/inventory/${steamId}`)
      return data
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error('Unauthorized: Please log in to view inventory')
      }
      if (error.response?.status === 404) {
        throw new Error('User not found or inventory is private')
      }
      if (error.response?.status === 500) {
        const errorMessage = error.response?.data?.error || 'Failed to fetch inventory from Steam'
        throw new Error(errorMessage)
      }
      throw new Error(error.response?.data?.error || 'Failed to fetch inventory')
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
