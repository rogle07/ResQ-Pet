/**
 * ResQPet - Secure IoT Device Provisioning Script
 *
 * Usage:
 *   node backend/scripts/provisionDevice.js [--deviceId <id>] [--name <name>] [--owner <email>]
 *
 * Example:
 *   node backend/scripts/provisionDevice.js --name "Max Collar"
 */
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const crypto = require('crypto');
const IoTDevice = require('../src/models/IoTDevice');
const User = require('../src/models/User');

const hashToken = (token) => crypto.createHash('sha256').update(String(token).trim()).digest('hex');

const parseArgs = () => {
  const args = process.argv.slice(2);
  const parsed = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--')) {
      const key = args[i].substring(2);
      const val = args[i + 1] && !args[i + 1].startsWith('--') ? args[++i] : true;
      parsed[key] = val;
    }
  }
  return parsed;
};

const run = async () => {
  if (!process.env.MONGO_URI) {
    console.error('ERROR: MONGO_URI is missing in backend/.env');
    process.exit(1);
  }

  const args = parseArgs();

  console.log('Connecting to MongoDB Atlas...');
  await mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 10000,
  });
  console.log('Connected to MongoDB.\n');

  // 1. Resolve or Generate Unique Device ID
  let deviceId = args.deviceId ? String(args.deviceId).trim().toUpperCase() : null;
  if (!deviceId) {
    const randomHex = crypto.randomBytes(3).toString('hex').toUpperCase();
    deviceId = `RQP-ESP32-${randomHex}`;
  }

  // Validate format
  if (!/^[A-Z0-9\-_]{4,32}$/i.test(deviceId)) {
    console.error('ERROR: Device ID must be 4-32 alphanumeric characters, dashes, or underscores');
    await mongoose.disconnect();
    process.exit(1);
  }

  const existing = await IoTDevice.findOne({ deviceId });
  if (existing) {
    console.error(`ERROR: Device ID ${deviceId} already exists in database`);
    await mongoose.disconnect();
    process.exit(1);
  }

  // 2. Resolve optional owner
  let owner = null;
  if (args.owner) {
    owner = await User.findOne({ email: String(args.owner).toLowerCase().trim() });
    if (!owner) {
      console.error(`ERROR: Owner with email ${args.owner} not found`);
      await mongoose.disconnect();
      process.exit(1);
    }
  }

  // 3. Generate Cryptographically Secure Device Token
  const rawToken = `rqp_sec_${crypto.randomBytes(24).toString('hex')}`;
  const tokenHash = hashToken(rawToken);

  // 4. Save to MongoDB (storing ONLY tokenHash, never plaintext token)
  const device = await IoTDevice.create({
    deviceId,
    deviceName: args.name || 'ResQPet Smart Collar',
    tokenHash,
    owner: owner ? owner._id : null,
    pet: null,
    status: 'registered',
    assignmentStatus: 'unassigned',
  });

  console.log('====================================================');
  console.log('       RESQPET IOT DEVICE PROVISIONED SUCCESSFULLY');
  console.log('====================================================');
  console.log(`Device ID:                 ${device.deviceId}`);
  console.log(`Device Name:               ${device.deviceName}`);
  console.log(`Device Registration Status: ${device.status}`);
  console.log(`Device Assignment Status:   ${device.assignmentStatus}`);
  console.log(`Owner:                     ${owner ? owner.email : 'None (Unassigned - Ready for Owner Claim)'}`);
  console.log('----------------------------------------------------');
  console.log(`Device Authentication Token (ONE-TIME SECRET):`);
  console.log(`${rawToken}`);
  console.log('----------------------------------------------------');
  console.log('SECURITY NOTICE:');
  console.log('Only the SHA-256 hash of this token has been stored in MongoDB.');
  console.log('Copy this token now to flash into your ESP32 config.h.');
  console.log('It CANNOT be retrieved again.\n');

  await mongoose.disconnect();
};

run().catch((err) => {
  console.error('Provisioning failed:', err.message);
  process.exit(1);
});

