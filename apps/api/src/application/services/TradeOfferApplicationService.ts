import { TradeOffer } from '../../domain/entities/TradeOffer.js'
import { TradeOfferId } from '../../domain/valueObjects/TradeOfferId.js'
import { UserId } from '../../domain/valueObjects/UserId.js'
import { TradeOfferItem } from '../../domain/valueObjects/TradeOfferItem.js'
import { ITradeOfferRepository } from '../../domain/repositories/ITradeOfferRepository.js'
import { IUserRepository } from '../../domain/repositories/IUserRepository.js'
import { randomUUID } from 'crypto'

export interface CreateTradeOfferCommand {
  fromUserId: string
  toUserId: string
  itemsFrom: Array<{
    assetId: string
    appId: number
    contextId: string
    amount: number
  }>
  itemsTo: Array<{
    assetId: string
    appId: number
    contextId: string
    amount: number
  }>
}

export class TradeOfferApplicationService {
  constructor(
    private readonly tradeOfferRepository: ITradeOfferRepository,
    private readonly userRepository: IUserRepository
  ) {}

  async createTradeOffer(command: CreateTradeOfferCommand): Promise<TradeOffer> {
    const fromUserId = UserId.create(command.fromUserId)
    const toUserId = UserId.create(command.toUserId)

    // Verify users exist
    const fromUser = await this.userRepository.findById(fromUserId)
    if (!fromUser) {
      throw new Error('From user not found')
    }

    const toUser = await this.userRepository.findById(toUserId)
    if (!toUser) {
      throw new Error('To user not found')
    }

    const itemsFrom = command.itemsFrom.map(item =>
      TradeOfferItem.create(item.assetId, item.appId, item.contextId, item.amount)
    )

    const itemsTo = command.itemsTo.map(item =>
      TradeOfferItem.create(item.assetId, item.appId, item.contextId, item.amount)
    )

    const tradeOffer = TradeOffer.create(
      TradeOfferId.create(randomUUID()),
      fromUserId,
      toUserId,
      itemsFrom,
      itemsTo
    )

    return await this.tradeOfferRepository.save(tradeOffer)
  }

  async getTradeOffers(userId: string): Promise<TradeOffer[]> {
    const userIdVO = UserId.create(userId)
    return await this.tradeOfferRepository.findByUserId(userIdVO)
  }

  async getTradeOfferById(id: string): Promise<TradeOffer> {
    const tradeOfferId = TradeOfferId.create(id)
    const tradeOffer = await this.tradeOfferRepository.findById(tradeOfferId)

    if (!tradeOffer) {
      throw new Error('Trade offer not found')
    }

    return tradeOffer
  }

  async acceptTradeOffer(id: string, userId: string): Promise<TradeOffer> {
    const tradeOfferId = TradeOfferId.create(id)
    const userIdVO = UserId.create(userId)

    const tradeOffer = await this.tradeOfferRepository.findById(tradeOfferId)
    if (!tradeOffer) {
      throw new Error('Trade offer not found')
    }

    tradeOffer.accept(userIdVO)
    return await this.tradeOfferRepository.save(tradeOffer)
  }

  async declineTradeOffer(id: string, userId: string): Promise<TradeOffer> {
    const tradeOfferId = TradeOfferId.create(id)
    const userIdVO = UserId.create(userId)

    const tradeOffer = await this.tradeOfferRepository.findById(tradeOfferId)
    if (!tradeOffer) {
      throw new Error('Trade offer not found')
    }

    tradeOffer.decline(userIdVO)
    return await this.tradeOfferRepository.save(tradeOffer)
  }
}
