export enum TradeOfferStatusEnum {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  DECLINED = 'DECLINED',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED',
}

export class TradeOfferStatus {
  private constructor(private readonly value: TradeOfferStatusEnum) {}

  static pending(): TradeOfferStatus {
    return new TradeOfferStatus(TradeOfferStatusEnum.PENDING)
  }

  static accepted(): TradeOfferStatus {
    return new TradeOfferStatus(TradeOfferStatusEnum.ACCEPTED)
  }

  static declined(): TradeOfferStatus {
    return new TradeOfferStatus(TradeOfferStatusEnum.DECLINED)
  }

  static cancelled(): TradeOfferStatus {
    return new TradeOfferStatus(TradeOfferStatusEnum.CANCELLED)
  }

  static expired(): TradeOfferStatus {
    return new TradeOfferStatus(TradeOfferStatusEnum.EXPIRED)
  }

  static fromString(value: string): TradeOfferStatus {
    const status = Object.values(TradeOfferStatusEnum).find(s => s === value)
    if (!status) {
      throw new Error(`Invalid trade offer status: ${value}`)
    }
    return new TradeOfferStatus(status)
  }

  getValue(): TradeOfferStatusEnum {
    return this.value
  }

  isPending(): boolean {
    return this.value === TradeOfferStatusEnum.PENDING
  }

  isAccepted(): boolean {
    return this.value === TradeOfferStatusEnum.ACCEPTED
  }

  isDeclined(): boolean {
    return this.value === TradeOfferStatusEnum.DECLINED
  }

  canBeModified(): boolean {
    return this.value === TradeOfferStatusEnum.PENDING
  }

  equals(other: TradeOfferStatus): boolean {
    return this.value === other.value
  }

  toString(): string {
    return this.value
  }
}
