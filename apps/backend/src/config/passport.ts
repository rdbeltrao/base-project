import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import bcrypt from 'bcryptjs';
import { User } from '@test-pod/database';
import dotenv from 'dotenv';
import { getUserForSession } from '../utils/user';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

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
            active: true
          }
        });

        if (!user) {
          return done(null, false, { message: 'Invalid credentials' });
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
          return done(null, false, { message: 'Invalid credentials' });
        }

        const sessionUser = await getUserForSession(user.id);

        if (!sessionUser) {
          return done(null, false, { message: 'Cannot create session user' });
        }

        return done(null, sessionUser);
      } catch (error) {
        return done(error);
      }
    }
  )
);

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
            active: true
          }
        });

        if (!user) {
          return done(null, false);
        }

        const sessionUser = await getUserForSession(user.id);

        if (!sessionUser) {
          return done(null, false, { message: 'Cannot create session user' });
        }

        return done(null, sessionUser);
      } catch (error) {
        return done(error, false);
      }
    }
  )
);

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: number, done) => {
  try {
    const sessionUser = await getUserForSession(id);
    done(null, sessionUser);
  } catch (error) {
    done(error, null);
  }
});

export default passport;
