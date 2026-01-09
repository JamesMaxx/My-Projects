#!/usr/bin/env node
/**
 * setup-appwrite-from-env.js
 *
 * Reads Appwrite connection info from environment variables (or .env.local) and
 * creates the database and collections required by the application.
 *
 * Environment variables (checked in order):
 * - APPWRITE_ENDPOINT or NEXT_PUBLIC_APPWRITE_ENDPOINT
 * - APPWRITE_PROJECT or NEXT_PUBLIC_APPWRITE_PROJECT
 * - APPWRITE_KEY (required; do NOT use NEXT_PUBLIC_APPWRITE_KEY)
 *
 * This script is idempotent and safe to run multiple times.
 */

const fs = require('fs');
const path = require('path');

function parseDotEnv(filePath) {
  const out = {};
  if (!fs.existsSync(filePath)) return out;
  const raw = fs.readFileSync(filePath, 'utf8');
  raw.split(/\r?\n/).forEach((line) => {
    line = line.trim();
    if (!line || line.startsWith('#')) return;
    const eq = line.indexOf('=');
    if (eq === -1) return;
    const k = line.slice(0, eq).trim();
    let v = line.slice(eq + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    out[k] = v;
  });
  return out;
}

// Load .env.local if present
const repoEnv = parseDotEnv(path.join(process.cwd(), '.env.local'));

const endpoint = process.env.APPWRITE_ENDPOINT || process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || repoEnv.APPWRITE_ENDPOINT || repoEnv.NEXT_PUBLIC_APPWRITE_ENDPOINT;
const project = process.env.APPWRITE_PROJECT || process.env.NEXT_PUBLIC_APPWRITE_PROJECT || repoEnv.APPWRITE_PROJECT || repoEnv.NEXT_PUBLIC_APPWRITE_PROJECT;
const key = process.env.APPWRITE_KEY || repoEnv.APPWRITE_KEY;

if (!endpoint) {
  console.error('Missing Appwrite endpoint. Set APPWRITE_ENDPOINT or NEXT_PUBLIC_APPWRITE_ENDPOINT or add to .env.local');
  process.exit(1);
}
if (!project) {
  console.error('Missing Appwrite project id. Set APPWRITE_PROJECT or NEXT_PUBLIC_APPWRITE_PROJECT or add to .env.local');
  process.exit(1);
}
if (!key) {
  console.error('Missing APPWRITE_KEY. This script requires an admin/project API key to create databases and collections.');
  process.exit(1);
}

// Require node-appwrite lazily so the script fails with a helpful message if not installed
let sdk;
try {
  sdk = require('node-appwrite');
} catch (e) {
  console.error('Please run: npm install node-appwrite');
  process.exit(1);
}

const client = new sdk.Client();
client
  .setEndpoint(endpoint.replace(/\/$/, ''))
  .setProject(project)
  .setKey(key);

const databases = new sdk.Databases(client);

const DB_ID = process.env.APPWRITE_DATABASE || process.env.NEXT_PUBLIC_APPWRITE_DATABASE || repoEnv.APPWRITE_DATABASE || repoEnv.NEXT_PUBLIC_APPWRITE_DATABASE;
const PROFILES_ID = process.env.APPWRITE_COLLECTION_PROFILES || process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_PROFILES || repoEnv.APPWRITE_COLLECTION_PROFILES || repoEnv.NEXT_PUBLIC_APPWRITE_COLLECTION_PROFILES || 'profiles';
const POSTS_ID = process.env.APPWRITE_COLLECTION_POSTS || process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_POSTS || repoEnv.APPWRITE_COLLECTION_POSTS || repoEnv.NEXT_PUBLIC_APPWRITE_COLLECTION_POSTS || 'posts';
const COMMENTS_ID = process.env.APPWRITE_COLLECTION_COMMENTS || process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_COMMENTS || repoEnv.APPWRITE_COLLECTION_COMMENTS || repoEnv.NEXT_PUBLIC_APPWRITE_COLLECTION_COMMENTS || 'comments';

if (!DB_ID) {
  console.error('No database id specified. Set APPWRITE_DATABASE or NEXT_PUBLIC_APPWRITE_DATABASE or add to .env.local. This script will not create a database with a hard-coded id.');
  process.exit(1);
}

async function safe(fn, name) {
  try {
    const res = await fn();
    console.log(`OK: ${name}`);
    return res;
  } catch (err) {
    // Detailed error logging so failures are easier to diagnose when run by the user.
    // Appwrite errors may contain fields not enumerable on Error, so stringify using getOwnPropertyNames.
    const code = err && (err.code || (err.response && err.response.status));
    if (code === 409 || (err && err.message && /already exists/i.test(err.message))) {
      console.log(`Exists: ${name}`);
      return null;
    }
    console.error(`Error during ${name}:`, err && err.message ? err.message : err);
    try {
      console.error('Full error (details):', JSON.stringify(err, Object.getOwnPropertyNames(err), 2));
    } catch (e) {
      console.error('Could not stringify error object', e);
    }
    return null;
  }
}

async function main() {
  console.log('Connecting to Appwrite at', endpoint.replace(/\/$/, ''), 'project', project);

  // Create Database
  await safe(() => databases.create(DB_ID, 'GitConnect DB'), `create database ${DB_ID}`);

  // Create Profiles collection (public read)
  await safe(() => databases.createCollection(DB_ID, PROFILES_ID, 'Profiles', ['role:all'], ['role:users']), `create collection ${PROFILES_ID}`);

  // Attributes for profiles
  await safe(() => databases.createStringAttribute(DB_ID, PROFILES_ID, 'name', 128, true), 'profiles.name');
  await safe(() => databases.createTextAttribute(DB_ID, PROFILES_ID, 'bio', false), 'profiles.bio');
  await safe(() => databases.createStringAttribute(DB_ID, PROFILES_ID, 'location', 64, false), 'profiles.location');
  await safe(() => databases.createStringAttribute(DB_ID, PROFILES_ID, 'githubUsername', 39, false), 'profiles.githubUsername');
  await safe(() => databases.createStringAttribute(DB_ID, PROFILES_ID, 'userId', 36, true), 'profiles.userId');
  await safe(() => databases.createTextAttribute(DB_ID, PROFILES_ID, 'education', false), 'profiles.education');
  await safe(() => databases.createTextAttribute(DB_ID, PROFILES_ID, 'experience', false), 'profiles.experience');

  // Posts collection
  await safe(() => databases.createCollection(DB_ID, POSTS_ID, 'Posts', ['role:all'], ['role:users']), `create collection ${POSTS_ID}`);
  // Verify collection exists
  await safe(() => databases.getCollection(DB_ID, POSTS_ID), `verify collection ${POSTS_ID}`);
  await safe(() => databases.createTextAttribute(DB_ID, POSTS_ID, 'body', true), 'posts.body');
  await safe(() => databases.createStringAttribute(DB_ID, POSTS_ID, 'author', 128, true), 'posts.author');
  await safe(() => databases.createStringAttribute(DB_ID, POSTS_ID, 'authorId', 36, true), 'posts.authorId');
  await safe(() => databases.createIntegerAttribute(DB_ID, POSTS_ID, 'likes', false), 'posts.likes');
  await safe(() => databases.createIntegerAttribute(DB_ID, POSTS_ID, 'dislikes', false), 'posts.dislikes');
  await safe(() => databases.createDatetimeAttribute(DB_ID, POSTS_ID, 'createdAt', true), 'posts.createdAt');

  // Comments collection
  await safe(() => databases.createCollection(DB_ID, COMMENTS_ID, 'Comments', ['role:all'], ['role:users']), `create collection ${COMMENTS_ID}`);
  // Verify collection exists
  await safe(() => databases.getCollection(DB_ID, COMMENTS_ID), `verify collection ${COMMENTS_ID}`);
  await safe(() => databases.createStringAttribute(DB_ID, COMMENTS_ID, 'postId', 36, true), 'comments.postId');
  await safe(() => databases.createTextAttribute(DB_ID, COMMENTS_ID, 'text', true), 'comments.text');
  await safe(() => databases.createStringAttribute(DB_ID, COMMENTS_ID, 'authorId', 36, true), 'comments.authorId');
  await safe(() => databases.createDatetimeAttribute(DB_ID, COMMENTS_ID, 'createdAt', true), 'comments.createdAt');

  console.log('\nSetup completed. Database ID:', DB_ID);
  console.log('Collections: profiles, posts, comments');
  console.log('If you want, set NEXT_PUBLIC_APPWRITE_DATABASE and collection IDs in your .env.local to match these IDs.');
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
