/**
 * ResQPet - Secure Admin Account Provisioning Script
 *
 * Usage:
 *   node backend/scripts/createAdmin.js [--email <admin-email>] [--password <password>] [--name <name>]
 *
 * Examples:
 *   node backend/scripts/createAdmin.js --email admin@resqpet.app --password "MySecretPass123!" --name "System Administrator"
 *   node backend/scripts/createAdmin.js (interactive prompt)
 */
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const readline = require('readline');
const crypto = require('crypto');
const User = require('../src/models/User');

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

const askQuestion = (query) => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) =>
    rl.question(query, (ans) => {
      rl.close();
      resolve(ans.trim());
    })
  );
};

const run = async () => {
  if (!process.env.MONGO_URI) {
    console.error('ERROR: MONGO_URI is missing in backend/.env');
    process.exit(1);
  }

  const args = parseArgs();

  let email = args.email;
  let name = args.name;
  let password = args.password;

  // Interactive prompts if flags not passed
  if (!email && process.stdin.isTTY) {
    email = await askQuestion('Enter Admin Email: ');
  }
  if (!email) {
    console.error('ERROR: Admin email is required (use --email <email>)');
    process.exit(1);
  }

  email = String(email).toLowerCase().trim();
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    console.error('ERROR: Invalid email format');
    process.exit(1);
  }

  if (!name && process.stdin.isTTY) {
    name = await askQuestion('Enter Admin Name [ResQPet Administrator]: ');
  }
  name = name || 'ResQPet Administrator';

  if (!password && process.stdin.isTTY) {
    password = await askQuestion('Enter Admin Password (min 8 chars, leave empty to generate random): ');
  }

  let generated = false;
  if (!password) {
    // Generate secure random password
    password = `Admin_${crypto.randomBytes(9).toString('base64url')}!`;
    generated = true;
  }

  if (password.length < 8) {
    console.error('ERROR: Password must be at least 8 characters long');
    process.exit(1);
  }

  console.log('\nConnecting to MongoDB Atlas...');
  await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 10000 });
  console.log('Connected to MongoDB.\n');

  let user = await User.findOne({ email }).select('+password');

  if (user) {
    console.log(`User '${email}' already exists. Updating to Administrator role...`);
    user.role = 'admin';
    user.name = name || user.name;
    user.isActive = true;
    user.isEmailVerified = true;
    user.isProfileComplete = true;
    user.password = password; // Will be hashed by pre('save') bcrypt hook
    await user.save();
    console.log('Account successfully updated to Administrator.');
  } else {
    // Create new admin user
    user = await User.create({
      name,
      email,
      password, // Will be hashed by pre('save') bcrypt hook with 12 salt rounds
      role: 'admin',
      isActive: true,
      isEmailVerified: true,
      isProfileComplete: true,
    });
    console.log('New Administrator account created successfully.');
  }

  console.log('====================================================');
  console.log('       RESQPET ADMIN ACCOUNT PROVISIONED');
  console.log('====================================================');
  console.log(`Admin Name:    ${user.name}`);
  console.log(`Admin Email:   ${user.email}`);
  console.log(`Assigned Role: ${user.role}`);
  console.log(`Status:        Active`);
  console.log(`Verified:      Yes`);
  console.log('----------------------------------------------------');
  if (generated) {
    console.log(`Generated Password (ONE-TIME DISPLAY):`);
    console.log(`${password}`);
    console.log('----------------------------------------------------');
  } else {
    console.log('Password has been securely hashed using bcrypt (12 rounds).');
  }
  console.log('SECURITY NOTICE:');
  console.log('- Store credentials in your password manager.');
  console.log('- Never commit passwords or tokens to version control.\n');

  await mongoose.disconnect();
};

run().catch((err) => {
  console.error('Failed to provision admin:', err.message);
  process.exit(1);
});
