import { User } from '../../domain/entities/User.js'
import { UserId } from '../../domain/valueObjects/UserId.js'
import { SteamId } from '../../domain/valueObjects/SteamId.js'
import { IUserRepository } from '../../domain/repositories/IUserRepository.js'
import { prisma } from '../../lib/prisma.js'

export class UserRepository implements IUserRepository {
  async createNew(steamId: SteamId, username: string, avatar: string): Promise<User> {
    const created = await prisma.user.create({
      data: {
        steamId: steamId.getValue(),
        username,
        avatar,
      },
    })

    return User.reconstitute(
      UserId.create(created.id),
      SteamId.create(created.steamId),
      created.username,
      created.avatar,
      created.createdAt,
      created.updatedAt
    )
  }
  async findById(id: UserId): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { id: id.getValue() },
    })

    if (!user) {
      return null
    }

    return User.reconstitute(
      UserId.create(user.id),
      SteamId.create(user.steamId),
      user.username,
      user.avatar,
      user.createdAt,
      user.updatedAt
    )
  }

  async findBySteamId(steamId: SteamId): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { steamId: steamId.getValue() },
    })

    if (!user) {
      return null
    }

    return User.reconstitute(
      UserId.create(user.id),
      SteamId.create(user.steamId),
      user.username,
      user.avatar,
      user.createdAt,
      user.updatedAt
    )
  }

  async save(user: User): Promise<User> {
    const existingUser = await prisma.user.findUnique({
      where: { steamId: user.getSteamId().getValue() },
    })

    if (existingUser) {
      const updated = await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          username: user.getUsername(),
          avatar: user.getAvatar(),
          updatedAt: user.getUpdatedAt(),
        },
      })

      return User.reconstitute(
        UserId.create(updated.id),
        SteamId.create(updated.steamId),
        updated.username,
        updated.avatar,
        updated.createdAt,
        updated.updatedAt
      )
    } else {
      // For new users, use createNew method
      return this.createNew(
        user.getSteamId(),
        user.getUsername(),
        user.getAvatar()
      )
    }
  }

  async exists(id: UserId): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { id: id.getValue() },
      select: { id: true },
    })

    return user !== null
  }
}
