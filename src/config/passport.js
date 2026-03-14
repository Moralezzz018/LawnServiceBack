const passport = require('passport');
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const env = require('./env');
const { User } = require('../db/models');

passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: env.jwt.secret,
    },
    async (payload, done) => {
      try {
        const user = await User.findOne({
          where: {
            id: payload.sub,
            role: 'OWNER',
            isActive: true,
          },
        });

        if (!user) return done(null, false);
        return done(null, user);
      } catch (error) {
        return done(error, false);
      }
    }
  )
);

module.exports = passport;
