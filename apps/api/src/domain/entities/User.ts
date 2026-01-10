import { UserId } from '../valueObjects/UserId.js'
import { SteamId } from '../valueObjects/SteamId.js'

export class User {
  private constructor(
    private readonly id: UserId,
    private readonly steamId: SteamId,
    private username: string,
    private avatar: string,
    private readonly createdAt: Date,
    private updatedAt: Date
  ) {}

  static create(
    id: UserId,
    steamId: SteamId,
    username: string,
    avatar: string = ''
  ): User {
    if (!username || username.trim().length === 0) {
      throw new Error('Username cannot be empty')
    }

    const now = new Date()
    return new User(id, steamId, username.trim(), avatar, now, now)
  }

  static reconstitute(
    id: UserId,
    steamId: SteamId,
    username: string,
    avatar: string,
    createdAt: Date,
    updatedAt: Date
  ): User {
    return new User(id, steamId, username, avatar, createdAt, updatedAt)
  }

  updateProfile(username: string, avatar: string): void {
    if (!username || username.trim().length === 0) {
      throw new Error('Username cannot be empty')
    }
    this.username = username.trim()
    this.avatar = avatar
    this.updatedAt = new Date()
  }

  getId(): UserId {
    return this.id
  }

  getSteamId(): SteamId {
    return this.steamId
  }

  getUsername(): string {
    return this.username
  }

  getAvatar(): string {
    return this.avatar
  }

  getCreatedAt(): Date {
    return this.createdAt
  }

  getUpdatedAt(): Date {
    return this.updatedAt
  }
}
