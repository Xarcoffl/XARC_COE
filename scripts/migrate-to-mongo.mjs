#!/usr/bin/env node

/**
 * MongoDB Atlas Data Migration & Seeding Tool
 * Migrates data from local data/db.json to MongoDB Atlas.
 *
 * Usage:
 *   node scripts/migrate-to-mongo.mjs
 *   or:
 *   node scripts/migrate-to-mongo.mjs "mongodb+srv://user:pass@cluster.mongodb.net/arvr_coe"
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { MongoClient } from 'mongodb';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// 1. Try to load environment variables from .env.local or .env if present
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
  } catch {
    // Keep rawPass if decode fails
  }
  const encodedPass = encodeURIComponent(pass);

  let cleanUser = user;
  try {
    cleanUser = decodeURIComponent(user);
  } catch {
    // Keep user if decode fails
  }
  const encodedUser = encodeURIComponent(cleanUser);

  return `${proto}${encodedUser}:${encodedPass}@${host}${rest}`;
}

const uriArg = process.argv[2];
const rawMongoUri = uriArg || process.env.MONGODB_URI;
const mongoUri = sanitizeMongoUri(rawMongoUri);
const dbName = process.env.MONGODB_DB || 'arvr_coe';

console.log('\n======================================================');
console.log(' AR/VR CENTRE OF EXCELLENCE - MONGODB MIGRATION TOOL');
console.log('======================================================\n');

if (!mongoUri) {
  console.error('❌ ERROR: MONGODB_URI is not defined.');
  console.error('\nPlease specify your connection string either in .env.local:');
  console.error('  MONGODB_URI="mongodb+srv://<username>:<password>@cluster.mongodb.net/arvr_coe"\n');
  console.error('Or pass it as a command line argument:');
  console.error('  node scripts/migrate-to-mongo.mjs "mongodb+srv://..."\n');
  process.exit(1);
}

const dbJsonPath = path.join(rootDir, 'data', 'db.json');
if (!fs.existsSync(dbJsonPath)) {
  console.error(`❌ ERROR: Source database file not found at: ${dbJsonPath}`);
  process.exit(1);
}

async function migrate() {
  const maskedUri = mongoUri.replace(/:([^@]+)@/, ':****@');
  console.log(`🔌 Connecting to MongoDB cluster: ${maskedUri}`);
  const client = new MongoClient(mongoUri);

  try {
    await client.connect();
    console.log('✅ Connected successfully to MongoDB!\n');

    const db = client.db(dbName);
    const rawData = fs.readFileSync(dbJsonPath, 'utf-8');
    const localData = JSON.parse(rawData);

    console.log('📦 Reading local data/db.json and migrating collections...\n');

    // 1. Admin Users
    if (Array.isArray(localData.admin_users) && localData.admin_users.length > 0) {
      const col = db.collection('admin_users');
      await col.createIndex({ email: 1 }, { unique: true });
      for (const user of localData.admin_users) {
        await col.updateOne({ email: user.email }, { $set: user }, { upsert: true });
      }
      console.log(`  ✓ admin_users: ${localData.admin_users.length} record(s) synced (email unique index ensured)`);
    }

    // 2. Settings (Single Document)
    if (localData.settings) {
      const col = db.collection('settings');
      await col.updateOne({ _id: 'site_settings' }, { $set: { ...localData.settings, _id: 'site_settings' } }, { upsert: true });
      console.log('  ✓ settings: site configuration document synced');
    }

    // 3. Home Content
    if (localData.home_content) {
      const col = db.collection('home_content');
      await col.updateOne({ _id: 'home_content' }, { $set: { ...localData.home_content, _id: 'home_content' } }, { upsert: true });
      console.log('  ✓ home_content: hero & preview pillars synced');
    }

    // 4. About Content
    if (localData.about_content) {
      const col = db.collection('about_content');
      await col.updateOne({ _id: 'about_content' }, { $set: { ...localData.about_content, _id: 'about_content' } }, { upsert: true });
      console.log('  ✓ about_content: vision & mandate synced');
    }

    // 5. Request Content
    if (localData.request_content) {
      const col = db.collection('request_content');
      await col.updateOne({ _id: 'request_content' }, { $set: { ...localData.request_content, _id: 'request_content' } }, { upsert: true });
      console.log('  ✓ request_content: departments & custom form questions synced');
    }

    // 6. Verticals
    if (Array.isArray(localData.verticals) && localData.verticals.length > 0) {
      const col = db.collection('verticals');
      await col.createIndex({ slug: 1 }, { unique: true });
      for (const item of localData.verticals) {
        await col.updateOne({ slug: item.slug }, { $set: item }, { upsert: true });
      }
      console.log(`  ✓ verticals: ${localData.verticals.length} pathway(s) synced (slug unique index ensured)`);
    }

    // 7. Projects
    if (Array.isArray(localData.projects) && localData.projects.length > 0) {
      const col = db.collection('projects');
      await col.createIndex({ slug: 1 }, { unique: true });
      for (const item of localData.projects) {
        await col.updateOne({ slug: item.slug }, { $set: item }, { upsert: true });
      }
      console.log(`  ✓ projects: ${localData.projects.length} project dossier(s) synced (slug unique index ensured)`);
    }

    // 8. Events
    if (Array.isArray(localData.events) && localData.events.length > 0) {
      const col = db.collection('events');
      await col.createIndex({ slug: 1 }, { unique: true });
      for (const item of localData.events) {
        await col.updateOne({ slug: item.slug }, { $set: item }, { upsert: true });
      }
      console.log(`  ✓ events: ${localData.events.length} event conclave(s) synced (slug unique index ensured)`);
    }

    // 9. Achievements
    if (Array.isArray(localData.achievements) && localData.achievements.length > 0) {
      const col = db.collection('achievements');
      await col.createIndex({ id: 1 }, { unique: true });
      for (const item of localData.achievements) {
        await col.updateOne({ id: item.id }, { $set: item }, { upsert: true });
      }
      console.log(`  ✓ achievements: ${localData.achievements.length} award & patent record(s) synced`);
    }

    // 10. Industry Records
    if (Array.isArray(localData.industry_records) && localData.industry_records.length > 0) {
      const col = db.collection('industry_records');
      await col.createIndex({ id: 1 }, { unique: true });
      for (const item of localData.industry_records) {
        await col.updateOne({ id: item.id }, { $set: item }, { upsert: true });
      }
      console.log(`  ✓ industry_records: ${localData.industry_records.length} enterprise partnership(s) synced`);
    }

    // 11. Student Requests
    if (Array.isArray(localData.student_requests) && localData.student_requests.length > 0) {
      const col = db.collection('student_requests');
      await col.createIndex({ register_number: 1 }, { unique: false });
      await col.createIndex({ id: 1 }, { unique: true });
      for (const item of localData.student_requests) {
        await col.updateOne({ id: item.id }, { $set: item }, { upsert: true });
      }
      console.log(`  ✓ student_requests: ${localData.student_requests.length} applicant record(s) synced`);
    }

    // 12. Admin Users
    if (Array.isArray(localData.admin_users) && localData.admin_users.length > 0) {
      const col = db.collection('admin_users');
      await col.createIndex({ id: 1 }, { unique: true });
      await col.createIndex({ email: 1 }, { unique: true });
      for (const item of localData.admin_users) {
        await col.updateOne({ id: item.id }, { $set: item }, { upsert: true });
      }
      console.log(`  ✓ admin_users: ${localData.admin_users.length} admin account(s) synced`);
    }

    console.log('\n======================================================');
    console.log(' 🎉 MIGRATION COMPLETE! YOUR MONGODB ATLAS DB IS READY');
    console.log('======================================================\n');
    console.log(`Database: "${dbName}"`);
    console.log('To run the app with MongoDB Atlas:');
    console.log('1. Keep MONGODB_URI in your .env.local file.');
    console.log('2. Run: npm run dev (or npm run start in production)\n');
  } catch (err) {
    console.error('❌ Migration failed with error:', err);
    process.exit(1);
  } finally {
    await client.close();
  }
}

migrate();
