import { User } from '../entities/User.js'
import { UserId } from '../valueObjects/UserId.js'
import { SteamId } from '../valueObjects/SteamId.js'

export interface IUserRepository {
  findById(id: UserId): Promise<User | null>
  findBySteamId(steamId: SteamId): Promise<User | null>
  save(user: User): Promise<User>
  exists(id: UserId): Promise<boolean>
  createNew(steamId: SteamId, username: string, avatar: string): Promise<User>
}
