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
        const steamId = identifier.split('/').pop() || ''
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
        return done(error, null)
      }
    }
  )
)
