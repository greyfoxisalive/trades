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
    const { data } = await api.get('/auth/me')
    return data
  },
}

export const inventoryApi = {
  getInventory: async (steamId: string): Promise<SteamInventoryItem[]> => {
    const { data } = await api.get(`/inventory/${steamId}`)
    return data
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
