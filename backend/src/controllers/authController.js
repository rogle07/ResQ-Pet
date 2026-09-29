const crypto = require('crypto');
const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const { sendTokenResponse, generateAccessToken } = require('../utils/generateToken');
const { sendEmail } = require('../services/emailService');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const register = asyncHandler(async (req, res) => {
  const { name, email, password, role, phone, address } = req.body;

  if (!email || !password || !name) {
    res.status(400);
    throw new Error('Name, email, and password are required');
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    res.status(400);
    throw new Error('An account with this email already exists');
  }

  const allowedSelfRegisterRoles = ['owner', 'finder', 'found_pet_reporter', 'rescue_team', 'ngo', 'adopter', 'foster_home', 'donor'];
  const finalRole = allowedSelfRegisterRoles.includes(role) ? role : 'owner';

  const verificationToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(verificationToken).digest('hex');

  let parsedAddress = undefined;
  if (address) {
    if (typeof address === 'string') {
      parsedAddress = { street: address };
    } else if (typeof address === 'object') {
      parsedAddress = address;
    }
  }

  const user = await User.create({
    name,
    email,
    password,
    phone,
    address: parsedAddress,
    role: finalRole,
    emailVerificationToken: hashedToken,
    emailVerificationExpires: Date.now() + 24 * 60 * 60 * 1000, // 24h
  });

  const verifyUrl = `${process.env.CLIENT_URL}/verify-email/${verificationToken}`;
  try {
    await sendEmail({
      to: user.email,
      subject: 'Verify your PetGuardian account',
      html: `<p>Hi ${user.name},</p><p>Please verify your email by clicking the link below:</p><a href="${verifyUrl}">${verifyUrl}</a>`,
    });
  } catch (err) {
    // Non-fatal: user can request resend later
  }

  sendTokenResponse(res, user, 201);
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res) => {
  const { email, password, role } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error('Please provide email and password');
  }

  const user = await User.findOne({ email }).select('+password');
  if (!user || !user.password || !(await user.comparePassword(password))) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  if (!user.isActive) {
    res.status(403);
    throw new Error('This account has been deactivated. Contact support.');
  }

  // Validate selected role matches account role (ignore if role not provided or if admin)
  if (role && user.role !== 'admin' && user.role !== role) {
    res.status(401);
    throw new Error(`This account is registered as "${user.role.replace('_', ' ')}". Please select the correct role.`);
  }

  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  sendTokenResponse(res, user, 200);
});

// @desc    Login / register via Google
// @route   POST /api/auth/google
// @access  Public
const googleLogin = asyncHandler(async (req, res) => {
  const { idToken, accessToken, role } = req.body;

  if (!idToken && !accessToken) {
    res.status(400);
    throw new Error('Google ID token or access token is required');
  }

  let email, name, sub, picture;

  if (accessToken) {
    // 1. Verify and fetch user profile with Google Access Token (OAuth2 Token Client)
    try {
      const googleRes = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` },
        timeout: 10000,
      });
      email = googleRes.data.email;
      name = googleRes.data.name;
      sub = googleRes.data.sub;
      picture = googleRes.data.picture;
    } catch (apiErr) {
      res.status(401);
      throw new Error('Invalid Google access token or unable to fetch user profile');
    }
  } else if (idToken) {
    // 2. Verify with Google ID Token (Google Identity Services / One Tap)
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      email = payload.email;
      name = payload.name;
      sub = payload.sub;
      picture = payload.picture;
    } catch (verifyErr) {
      // Fallback verification via Google's tokeninfo API
      try {
        const tokenInfoRes = await axios.get(`https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`, {
          timeout: 10000,
        });
        email = tokenInfoRes.data.email;
        name = tokenInfoRes.data.name;
        sub = tokenInfoRes.data.sub;
        picture = tokenInfoRes.data.picture;
      } catch (fallbackErr) {
        res.status(401);
        throw new Error('Invalid Google ID token');
      }
    }
  }

  if (!email) {
    res.status(400);
    throw new Error('Could not retrieve email from Google account');
  }

  let user = await User.findOne({ email });

  if (!user) {
    const allowedRoles = ['owner', 'finder', 'rescue_team', 'ngo', 'adopter', 'foster_home', 'donor'];
    const finalRole = allowedRoles.includes(role) ? role : 'owner';

    user = await User.create({
      name: name || 'Google User',
      email,
      googleId: sub,
      avatar: picture || '',
      isEmailVerified: true,
      role: finalRole,
    });
  } else {
    let modified = false;
    if (!user.googleId) {
      user.googleId = sub;
      modified = true;
    }
    if (!user.isEmailVerified) {
      user.isEmailVerified = true;
      modified = true;
    }
    if (!user.avatar && picture) {
      user.avatar = picture;
      modified = true;
    }
    if (modified) {
      await user.save({ validateBeforeSave: false });
    }
  }

  sendTokenResponse(res, user, 200);
});

// @desc    Login / register via Facebook
// @route   POST /api/auth/facebook
// @access  Public
const facebookLogin = asyncHandler(async (req, res) => {
  const { accessToken, role } = req.body;

  if (!accessToken) {
    res.status(400);
    throw new Error('Facebook access token is required');
  }

  // Verify token with Facebook Graph API and get user info
  const graphRes = await axios.get('https://graph.facebook.com/me', {
    params: {
      fields: 'id,name,email,picture.type(large)',
      access_token: accessToken,
    },
  });

  const fbUser = graphRes.data;

  if (!fbUser.id) {
    res.status(401);
    throw new Error('Invalid Facebook access token');
  }

  // Facebook may not return email if user has not granted the permission
  const email = fbUser.email || `fb_${fbUser.id}@facebook-noemail.resqpet.app`;
  const avatar = fbUser.picture?.data?.url || '';

  let user = await User.findOne({ $or: [{ facebookId: fbUser.id }, { email }] });

  if (!user) {
    const allowedRoles = ['owner', 'finder', 'rescue_team', 'ngo', 'adopter', 'foster_home', 'donor'];
    const finalRole = allowedRoles.includes(role) ? role : 'owner';

    user = await User.create({
      name: fbUser.name,
      email,
      facebookId: fbUser.id,
      avatar,
      isEmailVerified: !!fbUser.email,
      role: finalRole,
    });
  } else if (!user.facebookId) {
    user.facebookId = fbUser.id;
    if (!user.avatar && avatar) user.avatar = avatar;
    if (fbUser.email) user.isEmailVerified = true;
    await user.save({ validateBeforeSave: false });
  }

  sendTokenResponse(res, user, 200);
});

// @desc    Refresh access token using refresh token cookie
// @route   POST /api/auth/refresh
// @access  Public (requires refresh cookie)
const refreshToken = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken;
  if (!token) {
    res.status(401);
    throw new Error('No refresh token provided');
  }

  const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  const user = await User.findById(decoded.id);
  if (!user || !user.isActive) {
    res.status(401);
    throw new Error('Invalid refresh token');
  }

  const accessToken = generateAccessToken(user._id, user.role);
  res.json({ success: true, accessToken });
});

// @desc    Logout - clear refresh cookie
// @route   POST /api/auth/logout
// @access  Private
const logout = asyncHandler(async (req, res) => {
  res.clearCookie('refreshToken');
  res.json({ success: true, message: 'Logged out successfully' });
});

// @desc    Verify email
// @route   GET /api/auth/verify-email/:token
// @access  Public
const verifyEmail = asyncHandler(async (req, res) => {
  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpires: { $gt: Date.now() },
  });

  if (!user) {
    res.status(400);
    throw new Error('Verification link is invalid or has expired');
  }

  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  await user.save({ validateBeforeSave: false });

  res.json({ success: true, message: 'Email verified successfully' });
});

// @desc    Request password reset
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email });

  // Always respond success to avoid leaking which emails are registered
  if (!user) {
    return res.json({ success: true, message: 'If that email exists, a reset link has been sent.' });
  }

  const resetToken = crypto.randomBytes(32).toString('hex');
  user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  user.passwordResetExpires = Date.now() + 60 * 60 * 1000; // 1 hour
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
  await sendEmail({
    to: user.email,
    subject: 'PetGuardian Password Reset',
    html: `<p>You requested a password reset. Click below (valid for 1 hour):</p><a href="${resetUrl}">${resetUrl}</a>`,
  });

  res.json({ success: true, message: 'If that email exists, a reset link has been sent.' });
});

// @desc    Reset password
// @route   POST /api/auth/reset-password/:token
// @access  Public
const resetPassword = asyncHandler(async (req, res) => {
  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    res.status(400);
    throw new Error('Reset link is invalid or has expired');
  }

  user.password = req.body.password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  sendTokenResponse(res, user, 200);
});

// @desc    Get current logged-in user
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, user: req.user.toSafeObject() });
});

module.exports = {
  register,
  login,
  googleLogin,
  facebookLogin,
  refreshToken,
  logout,
  verifyEmail,
  forgotPassword,
  resetPassword,
  getMe,
};
