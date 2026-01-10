export class TradeOfferId {
  private constructor(private readonly value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error('TradeOfferId cannot be empty')
    }
  }

  static create(value: string): TradeOfferId {
    return new TradeOfferId(value)
  }

  getValue(): string {
    return this.value
  }

  equals(other: TradeOfferId): boolean {
    return this.value === other.value
  }

  toString(): string {
    return this.value
  }
}
