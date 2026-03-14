const passport = require('passport');

const authOwner = passport.authenticate('jwt', { session: false });

module.exports = authOwner;
