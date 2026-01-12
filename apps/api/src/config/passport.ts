import passport from 'passport'
import SteamStrategy from 'passport-steam'

passport.serializeUser((user: any, done) => {
  done(null, user)
})

passport.deserializeUser((obj: any, done) => {
  done(null, obj)
})

passport.use(
  new SteamStrategy(
    {
      returnURL: `${process.env.BACKEND_URL || 'http://localhost:3001'}/api/auth/steam/return`,
      realm: process.env.BACKEND_URL || 'http://localhost:3001',
      apiKey: process.env.STEAM_API_KEY || '',
    },
    async (identifier: string, profile: any, done: any) => {
      try {
        // Steam identifier обычно в формате "http://steamcommunity.com/openid/id/7656119..."
        // или просто Steam64 ID
        let steamId = identifier.split('/').pop() || ''
        
        // Если identifier уже является Steam64 ID (начинается с 7656119)
        if (identifier.startsWith('7656119')) {
          steamId = identifier
        }
        
        // Валидация Steam ID
        if (!steamId || !/^\d{17}$/.test(steamId)) {
          console.error('Invalid Steam ID format:', { identifier, steamId, profile })
          return done(new Error(`Invalid Steam ID format: ${steamId}`), null)
        }
        
        console.log('Steam authentication successful:', { steamId, username: profile.username })
        
        const photos = Array.isArray(profile.photos) ? profile.photos : []
        const user = {
          id: steamId,
          steamid: steamId,
          displayName: profile.displayName,
          username: profile.username,
          photos: photos,
          avatar: photos.length > 0 ? photos[0].value : undefined,
        }
        return done(null, user)
      } catch (error) {
        console.error('Passport Steam strategy error:', error)
        return done(error, null)
      }
    }
  )
)
