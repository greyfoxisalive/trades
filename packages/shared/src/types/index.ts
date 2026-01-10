export interface User {
  id: string;
  steamId: string;
  username: string;
  avatar: string;
  createdAt: Date;
}

export interface SteamInventoryItem {
  assetid: string;
  classid: string;
  instanceid: string;
  amount: string;
  appid: number;
  contextid: string;
  icon_url?: string;
  icon_url_large?: string;
  name?: string;
  market_hash_name?: string;
  tradable?: number;
  marketable?: number;
}

export interface TradeOfferItem {
  id: string;
  tradeOfferId: string;
  assetId: string;
  appId: number;
  contextId: string;
  amount: number;
}

export enum TradeOfferStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  DECLINED = 'DECLINED',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED'
}

export interface TradeOffer {
  id: string;
  fromUserId: string;
  toUserId: string;
  status: TradeOfferStatus;
  itemsFrom: TradeOfferItem[];
  itemsTo: TradeOfferItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTradeOfferRequest {
  toUserId: string;
  itemsFrom: Omit<TradeOfferItem, 'id' | 'tradeOfferId'>[];
  itemsTo: Omit<TradeOfferItem, 'id' | 'tradeOfferId'>[];
}
