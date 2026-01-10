import { TradeOffer } from '../entities/TradeOffer.js'
import { TradeOfferId } from '../valueObjects/TradeOfferId.js'
import { UserId } from '../valueObjects/UserId.js'

export interface ITradeOfferRepository {
  findById(id: TradeOfferId): Promise<TradeOffer | null>
  findByUserId(userId: UserId): Promise<TradeOffer[]>
  save(tradeOffer: TradeOffer): Promise<TradeOffer>
  delete(id: TradeOfferId): Promise<void>
}
