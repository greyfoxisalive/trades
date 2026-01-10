export class SteamId {
  private constructor(private readonly value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error('SteamId cannot be empty')
    }
  }

  static create(value: string): SteamId {
    return new SteamId(value)
  }

  getValue(): string {
    return this.value
  }

  equals(other: SteamId): boolean {
    return this.value === other.value
  }

  toString(): string {
    return this.value
  }
}
