import jwt from 'jsonwebtoken'
import { User } from '../../domain/entities/User.js'
import { UserId } from '../../domain/valueObjects/UserId.js'
import { SteamId } from '../../domain/valueObjects/SteamId.js'
import { IUserRepository } from '../../domain/repositories/IUserRepository.js'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

export class AuthApplicationService {
  constructor(private readonly userRepository: IUserRepository) {}

  async handleSteamCallback(steamUser: any): Promise<User> {
    const rawSteamId = steamUser.id || steamUser.steamid
    
    if (!rawSteamId) {
      throw new Error('Steam ID is missing from callback')
    }
    
    // Валидация формата Steam ID перед созданием
    if (!/^\d{17}$/.test(String(rawSteamId))) {
      console.error('Invalid Steam ID format in callback:', { steamUser, rawSteamId })
      throw new Error(`Invalid Steam ID format: ${rawSteamId}. Expected 17-digit Steam64 ID`)
    }
    
    console.log('Creating/updating user with Steam ID:', rawSteamId)
    const steamId = SteamId.create(String(rawSteamId))
    
    let user = await this.userRepository.findBySteamId(steamId)
    
    const photos = Array.isArray(steamUser.photos) ? steamUser.photos : []
    const avatar = photos.length > 0 ? photos[0].value : (steamUser.avatar || '')
    
    if (!user) {
      // Use repository's createNew method which handles ID generation
      user = await this.userRepository.createNew(
        steamId,
        steamUser.displayName || steamUser.username || 'Unknown',
        avatar
      )
    } else {
      user.updateProfile(
        steamUser.displayName || steamUser.username || user.getUsername(),
        avatar || user.getAvatar()
      )
      user = await this.userRepository.save(user)
    }
    
    return user
  }
  
  generateToken(user: User): string {
    return jwt.sign(
      { id: user.getId().getValue(), steamId: user.getSteamId().getValue() },
      JWT_SECRET,
      { expiresIn: '7d' }
    )
  }
  
  async verifyToken(token: string): Promise<User> {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; steamId: string }
    const userId = UserId.create(decoded.id)
    const user = await this.userRepository.findById(userId)
    
    if (!user) {
      throw new Error('User not found')
    }
    
    return user
  }
}
