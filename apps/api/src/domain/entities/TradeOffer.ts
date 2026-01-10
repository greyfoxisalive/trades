import { TradeOfferId } from '../valueObjects/TradeOfferId.js'
import { UserId } from '../valueObjects/UserId.js'
import { TradeOfferStatus } from '../valueObjects/TradeOfferStatus.js'
import { TradeOfferItem } from '../valueObjects/TradeOfferItem.js'

export class TradeOffer {
  private constructor(
    private readonly id: TradeOfferId,
    private readonly fromUserId: UserId,
    private readonly toUserId: UserId,
    private status: TradeOfferStatus,
    private readonly itemsFrom: TradeOfferItem[],
    private readonly itemsTo: TradeOfferItem[],
    private readonly createdAt: Date,
    private updatedAt: Date
  ) {
    if (itemsFrom.length === 0 && itemsTo.length === 0) {
      throw new Error('Trade offer must have at least one item')
    }
  }

  static create(
    id: TradeOfferId,
    fromUserId: UserId,
    toUserId: UserId,
    itemsFrom: TradeOfferItem[],
    itemsTo: TradeOfferItem[]
  ): TradeOffer {
    if (fromUserId.equals(toUserId)) {
      throw new Error('Cannot create trade offer to yourself')
    }

    const now = new Date()
    return new TradeOffer(
      id,
      fromUserId,
      toUserId,
      TradeOfferStatus.pending(),
      itemsFrom,
      itemsTo,
      now,
      now
    )
  }

  static reconstitute(
    id: TradeOfferId,
    fromUserId: UserId,
    toUserId: UserId,
    status: TradeOfferStatus,
    itemsFrom: TradeOfferItem[],
    itemsTo: TradeOfferItem[],
    createdAt: Date,
    updatedAt: Date
  ): TradeOffer {
    return new TradeOffer(
      id,
      fromUserId,
      toUserId,
      status,
      itemsFrom,
      itemsTo,
      createdAt,
      updatedAt
    )
  }

  accept(userId: UserId): void {
    if (!this.toUserId.equals(userId)) {
      throw new Error('Only the recipient can accept a trade offer')
    }

    if (!this.status.canBeModified()) {
      throw new Error(`Cannot accept trade offer with status: ${this.status.toString()}`)
    }

    this.status = TradeOfferStatus.accepted()
    this.updatedAt = new Date()
  }

  decline(userId: UserId): void {
    if (!this.toUserId.equals(userId)) {
      throw new Error('Only the recipient can decline a trade offer')
    }

    if (!this.status.canBeModified()) {
      throw new Error(`Cannot decline trade offer with status: ${this.status.toString()}`)
    }

    this.status = TradeOfferStatus.declined()
    this.updatedAt = new Date()
  }

  cancel(userId: UserId): void {
    if (!this.fromUserId.equals(userId)) {
      throw new Error('Only the creator can cancel a trade offer')
    }

    if (!this.status.canBeModified()) {
      throw new Error(`Cannot cancel trade offer with status: ${this.status.toString()}`)
    }

    this.status = TradeOfferStatus.cancelled()
    this.updatedAt = new Date()
  }

  getId(): TradeOfferId {
    return this.id
  }

  getFromUserId(): UserId {
    return this.fromUserId
  }

  getToUserId(): UserId {
    return this.toUserId
  }

  getStatus(): TradeOfferStatus {
    return this.status
  }

  getItemsFrom(): readonly TradeOfferItem[] {
    return [...this.itemsFrom]
  }

  getItemsTo(): readonly TradeOfferItem[] {
    return [...this.itemsTo]
  }

  getCreatedAt(): Date {
    return this.createdAt
  }

  getUpdatedAt(): Date {
    return this.updatedAt
  }

  isOwnedBy(userId: UserId): boolean {
    return this.fromUserId.equals(userId) || this.toUserId.equals(userId)
  }
}
