import passport from 'passport'
import { Strategy as LocalStrategy } from 'passport-local'
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt'
import { Strategy as GoogleStrategy, Profile } from 'passport-google-oauth20'
import bcrypt from 'bcryptjs'
import { User, Role } from '@test-pod/database'
import { getUserForSession } from '../utils/user'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET
const GOOGLE_CALLBACK_URL =
  process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3000/api/auth/google/callback'

// Log Google OAuth configuration status
if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
  console.log('Google OAuth credentials not configured. Google login will be disabled.')
} else {
  console.log('Google OAuth credentials configured successfully.')
}

passport.use(
  new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password',
    },
    async (email, password, done) => {
      try {
        const user = await User.findOne({
          where: {
            email,
            active: true,
          },
        })

        if (!user) {
          return done(null, false, { message: 'Invalid credentials' })
        }

        const isPasswordValid = await bcrypt.compare(password, user.password)
        if (!isPasswordValid) {
          return done(null, false, { message: 'Invalid credentials' })
        }

        const sessionUser = await getUserForSession(user.id)

        if (!sessionUser) {
          return done(null, false, { message: 'Cannot create session user' })
        }

        return done(null, sessionUser)
      } catch (error) {
        return done(error)
      }
    }
  )
)

passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: JWT_SECRET,
    },
    async (jwtPayload, done) => {
      try {
        const user = await User.findOne({
          where: {
            id: jwtPayload.id,
            active: true,
          },
        })

        if (!user) {
          return done(null, false)
        }

        const sessionUser = await getUserForSession(user.id)

        if (!sessionUser) {
          return done(null, false, { message: 'Cannot create session user' })
        }

        return done(null, sessionUser)
      } catch (error) {
        return done(error, false)
      }
    }
  )
)

passport.serializeUser((user: any, done) => {
  done(null, user.id)
})

passport.deserializeUser(async (id: number, done) => {
  try {
    const sessionUser = await getUserForSession(id)
    done(null, sessionUser)
  } catch (error) {
    done(error, null)
  }
})

// Google OAuth Strategy - only initialize if credentials are available
if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: GOOGLE_CALLBACK_URL,
        scope: ['profile', 'email', 'https://www.googleapis.com/auth/calendar'],
        accessType: 'offline',
        prompt: 'consent',
      },
      async (
        accessToken: string,
        refreshToken: string | undefined,
        profile: Profile,
        done: any
      ) => {
        try {
          let user = await User.findOne({
            where: { googleId: profile.id },
          })

          if (!user && profile.emails && profile.emails[0]) {
            user = await User.findOne({
              where: { email: profile.emails[0].value },
            })

            if (user) {
              await user.update({
                googleId: profile.id,
                googleAccessToken: accessToken,
                googleRefreshToken: refreshToken,
                googleTokenExpiry: refreshToken ? new Date(Date.now() + 3600000) : undefined, // 1 hour from now
              })
            }
          }

          if (!user && profile.emails && profile.emails[0]) {
            user = await User.create({
              name: profile.displayName || profile.emails[0].value.split('@')[0],
              email: profile.emails[0].value,
              password: '',
              googleId: profile.id,
              googleAccessToken: accessToken,
              googleRefreshToken: refreshToken,
              googleTokenExpiry: refreshToken ? new Date(Date.now() + 3600000) : undefined,
              active: true,
            })

            const defaultRole = await Role.findOne({ where: { name: 'user' } })
            if (defaultRole) {
              await user.addRole(defaultRole.id)
            }
          }

          if (!user) {
            return done(null, false, { message: 'Could not create user from Google profile' })
          }

          if (user.googleAccessToken !== accessToken) {
            await user.update({
              googleAccessToken: accessToken,
              googleRefreshToken: refreshToken || user.googleRefreshToken,
              googleTokenExpiry: new Date(Date.now() + 3600000),
            })
          }

          const sessionUser = await getUserForSession(user.id)

          if (!sessionUser) {
            return done(null, false, { message: 'Cannot create session user' })
          }

          return done(null, sessionUser)
        } catch (error) {
          return done(error)
        }
      }
    )
  )
}

export default passport
