#!/usr/bin/env node

/**
 * Administrative User CLI Management Utility
 *
 * Provides terminal-based management of AR/VR CoE administrative accounts.
 * Syncs automatically with local data/db.json AND MongoDB Atlas (if configured).
 *
 * Usage:
 *   node scripts/manage-admin.mjs list
 *   node scripts/manage-admin.mjs set-password <email> <newPassword>
 *   node scripts/manage-admin.mjs set-email <oldEmail> <newEmail>
 *   node scripts/manage-admin.mjs set-name <email> <newName>
 *   node scripts/manage-admin.mjs create <email> <password> [name] [role]
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import { MongoClient } from 'mongodb';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const dbDir = path.join(rootDir, 'data');
const dbFile = path.join(dbDir, 'db.json');

// 1. Load environment variables from .env.local or .env
function loadEnv() {
  const envFiles = ['.env.local', '.env'];
  for (const file of envFiles) {
    const fullPath = path.join(rootDir, file);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf-8');
      content.split('\n').forEach((line) => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
          const [key, ...values] = trimmed.split('=');
          const val = values.join('=').trim().replace(/^["']|["']$/g, '');
          if (!process.env[key.trim()]) {
            process.env[key.trim()] = val;
          }
        }
      });
    }
  }
}

loadEnv();

function sanitizeMongoUri(rawUri) {
  if (!rawUri) return rawUri;
  const trimmed = rawUri.trim().replace(/^["']|["']$/g, '');
  const match = trimmed.match(/^(mongodb(?:\+srv)?:\/\/)([^:]+):(.*)@([^/?#]+)(.*)$/);
  if (!match) return trimmed;
  const [, proto, user, rawPass, host, rest] = match;
  let pass = rawPass;
  try {
    pass = decodeURIComponent(rawPass);
  } catch {}
  const encodedPass = encodeURIComponent(pass);
  return `${proto}${user}:${encodedPass}@${host}${rest}`;
}

// Read local DB
function readLocalDb() {
  if (!fs.existsSync(dbFile)) {
    throw new Error(`Database file not found at ${dbFile}`);
  }
  const content = fs.readFileSync(dbFile, 'utf-8');
  return JSON.parse(content);
}

// Write local DB atomically
function writeLocalDb(db) {
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }
  const tempFile = `${dbFile}.tmp.${Date.now()}`;
  fs.writeFileSync(tempFile, JSON.stringify(db, null, 2), 'utf-8');
  fs.renameSync(tempFile, dbFile);
}

// Connect to MongoDB Atlas (if configured)
async function getMongoClient() {
  const uri = process.env.MONGODB_URI;
  if (!uri) return null;
  const cleanUri = sanitizeMongoUri(uri);
  const client = new MongoClient(cleanUri, {
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 5000,
  });
  await client.connect();
  return client;
}

function showHelp() {
  console.log(`
======================================================================
  AR/VR Centre of Excellence - Administrative User Management CLI
======================================================================

Commands:
  list
      List all existing administrator accounts.
      Example: node scripts/manage-admin.mjs list

  set-password <email> <newPassword>
      Reset or update the password for an admin user.
      Example: node scripts/manage-admin.mjs set-password admin@coe.edu "NewPass@2026!"

  set-email <oldEmail> <newEmail>
      Change the login email address of an admin account.
      Example: node scripts/manage-admin.mjs set-email admin@coe.edu newadmin@institution.edu

  set-name <email> <newName>
      Update the display name of an admin account.
      Example: node scripts/manage-admin.mjs set-name admin@coe.edu "Director Dr. K. Raman"

  create <email> <password> [name] [role]
      Create a new administrator account (role: admin or superadmin).
      Example: node scripts/manage-admin.mjs create labadmin@coe.edu "LabAdmin@2026!" "Lab Coordinator" admin

Note:
  Updates are automatically applied to local data/db.json AND synced
  to your connected MongoDB Atlas database if MONGODB_URI is set.
`);
}

async function run() {
  const args = process.argv.slice(2);
  const command = (args[0] || '').toLowerCase();

  if (!command || command === 'help' || command === '--help' || command === '-h') {
    showHelp();
    return;
  }

  const db = readLocalDb();
  if (!Array.isArray(db.admin_users)) {
    db.admin_users = [];
  }

  let mongoClient = null;
  let mongoCol = null;
  try {
    mongoClient = await getMongoClient();
    if (mongoClient) {
      const dbName = process.env.MONGODB_DB_NAME || 'arvr_coe';
      mongoCol = mongoClient.db(dbName).collection('admin_users');
      console.log(`🔌 Connected to MongoDB Atlas [${dbName}]. Changes will synchronize to the cloud.`);
    } else {
      console.log('ℹ️  MONGODB_URI not configured. Changes will apply to local data/db.json only.');
    }
  } catch (err) {
    console.warn(`⚠️  Could not connect to MongoDB Atlas (${err.message}). Local database will still be updated.`);
  }

  try {
    switch (command) {
      case 'list': {
        console.log('\n--- Registered Administrative Users ---');
        if (db.admin_users.length === 0) {
          console.log('No administrator users found.');
        } else {
          console.table(
            db.admin_users.map((u) => ({
              ID: u.id,
              Name: u.name,
              Email: u.email,
              Role: u.role,
              'Created At': u.created_at,
              'Last Updated': u.updated_at || u.created_at,
            }))
          );
        }
        break;
      }

      case 'set-password': {
        const email = args[1]?.trim().toLowerCase();
        const newPassword = args[2];

        if (!email || !newPassword) {
          console.error('❌ Error: Both <email> and <newPassword> are required.');
          console.log('Usage: node scripts/manage-admin.mjs set-password <email> <newPassword>');
          process.exit(1);
        }

        if (newPassword.length < 8) {
          console.error('❌ Error: Password must be at least 8 characters long.');
          process.exit(1);
        }

        const admin = db.admin_users.find((u) => u.email.toLowerCase() === email);
        if (!admin) {
          console.error(`❌ Error: Administrator with email "${email}" not found.`);
          process.exit(1);
        }

        const salt = bcrypt.genSaltSync(10);
        admin.password_hash = bcrypt.hashSync(newPassword, salt);
        admin.updated_at = new Date().toISOString();

        writeLocalDb(db);
        console.log(`✓ Local database updated: Password changed for "${admin.email}" (${admin.name}).`);

        if (mongoCol) {
          await mongoCol.updateOne(
            { id: admin.id },
            { $set: { password_hash: admin.password_hash, updated_at: admin.updated_at } },
            { upsert: true }
          );
          console.log(`✓ MongoDB Atlas synchronized: Admin credentials securely hashed and stored.`);
        }
        console.log(`\n🎉 Success! You can now log into the web admin panel using:`);
        console.log(`   Email:    ${admin.email}`);
        console.log(`   Password: ${newPassword}\n`);
        break;
      }

      case 'set-email': {
        const oldEmail = args[1]?.trim().toLowerCase();
        const newEmail = args[2]?.trim().toLowerCase();

        if (!oldEmail || !newEmail) {
          console.error('❌ Error: Both <oldEmail> and <newEmail> are required.');
          console.log('Usage: node scripts/manage-admin.mjs set-email <oldEmail> <newEmail>');
          process.exit(1);
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(newEmail)) {
          console.error('❌ Error: Invalid new email format.');
          process.exit(1);
        }

        const admin = db.admin_users.find((u) => u.email.toLowerCase() === oldEmail);
        if (!admin) {
          console.error(`❌ Error: Administrator with email "${oldEmail}" not found.`);
          process.exit(1);
        }

        const duplicate = db.admin_users.find((u) => u.id !== admin.id && u.email.toLowerCase() === newEmail);
        if (duplicate) {
          console.error(`❌ Error: Email "${newEmail}" is already used by another administrator.`);
          process.exit(1);
        }

        admin.email = newEmail;
        admin.updated_at = new Date().toISOString();

        writeLocalDb(db);
        console.log(`✓ Local database updated: Email altered from "${oldEmail}" to "${newEmail}".`);

        if (mongoCol) {
          await mongoCol.updateOne(
            { id: admin.id },
            { $set: { email: newEmail, updated_at: admin.updated_at } },
            { upsert: true }
          );
          console.log(`✓ MongoDB Atlas synchronized: Admin account email updated.`);
        }
        console.log(`\n🎉 Success! New login email is: ${newEmail}\n`);
        break;
      }

      case 'set-name': {
        const email = args[1]?.trim().toLowerCase();
        const newName = args.slice(2).join(' ').trim();

        if (!email || !newName) {
          console.error('❌ Error: Both <email> and <newName> are required.');
          console.log('Usage: node scripts/manage-admin.mjs set-name <email> <newName>');
          process.exit(1);
        }

        const admin = db.admin_users.find((u) => u.email.toLowerCase() === email);
        if (!admin) {
          console.error(`❌ Error: Administrator with email "${email}" not found.`);
          process.exit(1);
        }

        admin.name = newName;
        admin.updated_at = new Date().toISOString();

        writeLocalDb(db);
        console.log(`✓ Local database updated: Display name set to "${newName}".`);

        if (mongoCol) {
          await mongoCol.updateOne(
            { id: admin.id },
            { $set: { name: newName, updated_at: admin.updated_at } },
            { upsert: true }
          );
          console.log(`✓ MongoDB Atlas synchronized.`);
        }
        break;
      }

      case 'create': {
        const email = args[1]?.trim().toLowerCase();
        const password = args[2];
        const name = args[3]?.trim() || 'CoE Administrator';
        const role = args[4]?.trim() || 'admin';

        if (!email || !password) {
          console.error('❌ Error: Both <email> and <password> are required to create an admin.');
          console.log('Usage: node scripts/manage-admin.mjs create <email> <password> [name] [role]');
          process.exit(1);
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          console.error('❌ Error: Invalid email format.');
          process.exit(1);
        }

        if (password.length < 8) {
          console.error('❌ Error: Password must be at least 8 characters long.');
          process.exit(1);
        }

        const duplicate = db.admin_users.find((u) => u.email.toLowerCase() === email);
        if (duplicate) {
          console.error(`❌ Error: An administrator with email "${email}" already exists.`);
          process.exit(1);
        }

        const salt = bcrypt.genSaltSync(10);
        const newAdmin = {
          id: `admin-${Date.now()}`,
          email,
          password_hash: bcrypt.hashSync(password, salt),
          name,
          role,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        db.admin_users.push(newAdmin);
        writeLocalDb(db);
        console.log(`✓ Local database updated: Created administrator "${email}".`);

        if (mongoCol) {
          await mongoCol.updateOne({ id: newAdmin.id }, { $set: newAdmin }, { upsert: true });
          console.log(`✓ MongoDB Atlas synchronized: Admin account created in cloud.`);
        }

        console.log(`\n🎉 New administrator account created successfully!`);
        console.log(`   ID:       ${newAdmin.id}`);
        console.log(`   Name:     ${newAdmin.name}`);
        console.log(`   Email:    ${newAdmin.email}`);
        console.log(`   Role:     ${newAdmin.role}\n`);
        break;
      }

      default:
        console.error(`❌ Unknown command: "${command}"`);
        showHelp();
        process.exit(1);
    }
  } finally {
    if (mongoClient) {
      await mongoClient.close();
    }
  }
}

run().catch((err) => {
  console.error('Fatal CLI Error:', err);
  process.exit(1);
});
