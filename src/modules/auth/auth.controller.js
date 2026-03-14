const argon2 = require('argon2');
const env = require('../../config/env');
const { User } = require('../../db/models');
const { signOwnerToken } = require('../../utils/jwt');

async function registerOwner(req, res, next) {
  try {
    const { bootstrapKey, fullName, email, password } = req.body;

    if (bootstrapKey !== env.ownerBootstrapKey) {
      return res.status(403).json({ message: 'Invalid bootstrap key' });
    }

    const ownerExists = await User.findOne({ where: { role: 'OWNER' } });
    if (ownerExists) {
      return res.status(409).json({ message: 'Owner account already exists' });
    }

    const passwordHash = await argon2.hash(password);

    const owner = await User.create({
      fullName,
      email,
      passwordHash,
      role: 'OWNER',
      isActive: true,
    });

    return res.status(201).json({
      message: 'Owner account created successfully',
      data: {
        id: owner.id,
        fullName: owner.fullName,
        email: owner.email,
      },
    });
  } catch (error) {
    return next(error);
  }
}

async function loginOwner(req, res, next) {
  try {
    const { email, password } = req.body;

    const owner = await User.findOne({ where: { email, role: 'OWNER', isActive: true } });
    if (!owner) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isValid = await argon2.verify(owner.passwordHash, password);
    if (!isValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = signOwnerToken(owner);

    return res.json({
      message: 'Login successful',
      data: {
        token,
        owner: {
          id: owner.id,
          fullName: owner.fullName,
          email: owner.email,
          role: owner.role,
        },
      },
    });
  } catch (error) {
    return next(error);
  }
}

async function me(req, res) {
  return res.json({
    data: {
      id: req.user.id,
      fullName: req.user.fullName,
      email: req.user.email,
      role: req.user.role,
    },
  });
}

module.exports = {
  registerOwner,
  loginOwner,
  me,
};
