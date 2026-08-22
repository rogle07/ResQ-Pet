const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const ROLES = ['owner', 'rescue_team', 'ngo', 'foster_home', 'veterinarian', 'finder', 'admin'];

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Name is required'], trim: true, maxlength: 100 },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      minlength: 8,
      select: false,
      required: function () {
        return !this.googleId && !this.facebookId && !this.appleId;
      },
    },
    googleId: { type: String, default: null },
    facebookId: { type: String, default: null },
    appleId: { type: String, default: null },
    avatar: { type: String, default: '' },
    phone: { type: String, trim: true },
    address: {
      street: String,
      city: String,
      state: String,
      country: String,
      zipCode: String,
      coordinates: {
        lat: Number,
        lng: Number,
      },
    },
    role: {
      type: String,
      enum: ROLES,
      default: 'owner',
      required: true,
    },
    isEmailVerified: { type: Boolean, default: false },
    emailVerificationToken: { type: String, select: false },
    emailVerificationExpires: { type: Date, select: false },
    passwordResetToken: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },
    isActive: { type: Boolean, default: true },
    isProfileComplete: { type: Boolean, default: false },

    // Role-specific extension refs (populated conditionally)
    ngoDetails: {
      organizationName: String,
      registrationNumber: String,
      verified: { type: Boolean, default: false },
    },
    rescueTeamDetails: {
      teamName: String,
      jurisdiction: String,
      verified: { type: Boolean, default: false },
    },
    veterinarianDetails: {
      clinicName: String,
      licenseNumber: String,
      specialization: String,
      verified: { type: Boolean, default: false },
    },
    fosterHomeDetails: {
      capacity: Number,
      currentOccupancy: { type: Number, default: 0 },
      verified: { type: Boolean, default: false },
    },

    fcmTokens: [{ type: String }],
    lastLogin: Date,
  },
  { timestamps: true }
);

userSchema.index({ role: 1 });
userSchema.index({ 'address.coordinates': '2dsphere' });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.emailVerificationToken;
  delete obj.passwordResetToken;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
module.exports.ROLES = ROLES;
