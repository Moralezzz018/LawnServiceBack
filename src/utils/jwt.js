const jwt = require('jsonwebtoken');
const env = require('../config/env');

function signOwnerToken(user) {
  return jwt.sign(
    {
      role: user.role,
      email: user.email,
    },
    env.jwt.secret,
    {
      subject: user.id,
      expiresIn: env.jwt.expiresIn,
    }
  );
}

module.exports = {
  signOwnerToken,
};
