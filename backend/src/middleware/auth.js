const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const crypto = require('crypto');
const User = require('../models/User');

const toValidObjectId = (id, seed = '') => {
  if (id && mongoose.Types.ObjectId.isValid(id) && String(new mongoose.Types.ObjectId(id)) === String(id)) {
    return new mongoose.Types.ObjectId(id);
  }
  const hash = crypto.createHash('md5').update(String(id || seed || 'demo-user-seed')).digest('hex').substring(0, 24);
  return new mongoose.Types.ObjectId(hash);
};

// Protect routes - requires valid access token
const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized. No token provided.');
  }

  // Handle demo / offline tokens gracefully
  if (token.startsWith('demo-')) {
    const demoObjectId = toValidObjectId('demo-user-id');
    if (mongoose.connection.readyState === 1) {
      try {
        await User.findByIdAndUpdate(
          demoObjectId,
          {
            _id: demoObjectId,
            name: 'ResQPet User',
            email: 'demo@resqpet.app',
            role: 'owner',
            isActive: true,
            isEmailVerified: true,
          },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );
      } catch {
        // ignore DB error
      }
    }

    req.user = {
      _id: demoObjectId,
      id: demoObjectId.toString(),
      role: 'owner',
      email: 'demo@resqpet.app',
      name: 'ResQPet User',
      isActive: true,
      isEmailVerified: true,
      toSafeObject: function () {
        return this;
      },
    };
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    let user = null;
    const validId = toValidObjectId(decoded.id, decoded.email);

    if (mongoose.connection.readyState === 1) {
      try {
        user = await User.findById(validId);
      } catch (err) {
        // ignore DB error
      }
    }

    if (!user) {
      user = {
        _id: validId,
        id: validId.toString(),
        role: decoded.role || 'owner',
        email: decoded.email || 'user@resqpet.app',
        name: decoded.name || 'ResQPet User',
        isActive: true,
        isEmailVerified: true,
        toSafeObject: function () {
          return this;
        },
      };
    }

    if (!user.isActive) {
      res.status(401);
      throw new Error('Not authorized. User no longer exists or is deactivated.');
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401);
    throw new Error('Not authorized. Invalid or expired token.');
  }
});

// Restrict access to specific roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      res.status(403);
      throw new Error(`Role '${req.user.role}' is not permitted to access this resource.`);
    }
    next();
  };
};

module.exports = { protect, authorize };
