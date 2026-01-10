export class TradeOfferItem {
  private constructor(
    private readonly assetId: string,
    private readonly appId: number,
    private readonly contextId: string,
    private readonly amount: number
  ) {
    if (!assetId || assetId.trim().length === 0) {
      throw new Error('AssetId cannot be empty')
    }
    if (appId <= 0) {
      throw new Error('AppId must be positive')
    }
    if (!contextId || contextId.trim().length === 0) {
      throw new Error('ContextId cannot be empty')
    }
    if (amount <= 0) {
      throw new Error('Amount must be positive')
    }
  }

  static create(
    assetId: string,
    appId: number,
    contextId: string,
    amount: number = 1
  ): TradeOfferItem {
    return new TradeOfferItem(assetId, appId, contextId, amount)
  }

  getAssetId(): string {
    return this.assetId
  }

  getAppId(): number {
    return this.appId
  }

  getContextId(): string {
    return this.contextId
  }

  getAmount(): number {
    return this.amount
  }

  equals(other: TradeOfferItem): boolean {
    return (
      this.assetId === other.assetId &&
      this.appId === other.appId &&
      this.contextId === other.contextId &&
      this.amount === other.amount
    )
  }
}
