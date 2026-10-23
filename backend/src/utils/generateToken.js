const jwt = require('jsonwebtoken');

const generateAccessToken = (userId, role, extra = {}) => {
  return jwt.sign({ id: userId, role, ...extra }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

const generateRefreshToken = (userId, role = 'owner') => {
  return jwt.sign({ id: userId, role }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  });
};

const sendTokenResponse = (res, user, statusCode = 200) => {
  const userId = user._id || user.id || `user-${Date.now()}`;
  const userRole = user.role || 'owner';
  const accessToken = generateAccessToken(userId, userRole, {
    email: user.email,
    name: user.name,
  });
  const refreshToken = generateRefreshToken(userId, userRole);

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });

  const safeUser = typeof user.toSafeObject === 'function' ? user.toSafeObject() : user;

  res.status(statusCode).json({
    success: true,
    accessToken,
    user: safeUser,
  });
};

module.exports = { generateAccessToken, generateRefreshToken, sendTokenResponse };
