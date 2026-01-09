#!/usr/bin/env node
/**
 * setup-appwrite.js
 *
 * Idempotent Node script to create an Appwrite Database and three collections:
 * - profiles
 * - posts
 * - comments
 *
 * Usage (env variables):
 * APPWRITE_ENDPOINT, APPWRITE_PROJECT, APPWRITE_KEY
 *
 * Or pass as CLI args:
 * --endpoint https://cloud.appwrite.io --project PROJECT_ID --key API_KEY
 *
 * NOTE: This script uses the Appwrite Node SDK. Install dependencies before running:
 * npm install node-appwrite
 */

const sdk = require('node-appwrite');

function argvArg(name) {
  const idx = process.argv.indexOf(name);
  if (idx === -1) return null;
  return process.argv[idx + 1];
}

const endpoint = argvArg('--endpoint') || process.env.APPWRITE_ENDPOINT || process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
const project = argvArg('--project') || process.env.APPWRITE_PROJECT || process.env.NEXT_PUBLIC_APPWRITE_PROJECT;
const key = argvArg('--key') || process.env.APPWRITE_KEY;

if (!endpoint || !project || !key) {
  console.error('Missing required Appwrite connection info. Provide --endpoint, --project, --key or set APPWRITE_ENDPOINT, APPWRITE_PROJECT, APPWRITE_KEY env variables.');
  process.exit(1);
}

const client = new sdk.Client();
client
  .setEndpoint(endpoint.replace(/\/$/, ''))
  .setProject(project)
  .setKey(key);

const databases = new sdk.Databases(client);

// IDs we will use (can be overridden via CLI or env vars)
// CLI args: --database <id> --profiles <id> --posts <id> --comments <id>
const DB_ID = argvArg('--database') || process.env.APPWRITE_DATABASE || process.env.NEXT_PUBLIC_APPWRITE_DATABASE || 'gitconnect_db';
const PROFILES_ID = argvArg('--profiles') || process.env.APPWRITE_COLLECTION_PROFILES || process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_PROFILES || 'profiles';
const POSTS_ID = argvArg('--posts') || process.env.APPWRITE_COLLECTION_POSTS || process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_POSTS || 'posts';
const COMMENTS_ID = argvArg('--comments') || process.env.APPWRITE_COLLECTION_COMMENTS || process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_COMMENTS || 'comments';

if (!DB_ID) {
  console.error('No database id specified. Provide --database or set APPWRITE_DATABASE / NEXT_PUBLIC_APPWRITE_DATABASE.');
  process.exit(1);
}

async function safe(fn, name) {
  try {
    const res = await fn();
    console.log(`OK: ${name}`);
    return res;
  } catch (err) {
    // If already exists, many Appwrite endpoints return 409
    if (err && err.code === 409) {
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
  console.log('Connecting to Appwrite at', endpoint, 'project', project);

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
  await safe(() => databases.getCollection(DB_ID, POSTS_ID), `verify collection ${POSTS_ID}`);
  await safe(() => databases.createTextAttribute(DB_ID, POSTS_ID, 'body', true), 'posts.body');
  await safe(() => databases.createStringAttribute(DB_ID, POSTS_ID, 'author', 128, true), 'posts.author');
  await safe(() => databases.createStringAttribute(DB_ID, POSTS_ID, 'authorId', 36, true), 'posts.authorId');
  await safe(() => databases.createIntegerAttribute(DB_ID, POSTS_ID, 'likes', false), 'posts.likes');
  await safe(() => databases.createIntegerAttribute(DB_ID, POSTS_ID, 'dislikes', false), 'posts.dislikes');
  await safe(() => databases.createDatetimeAttribute(DB_ID, POSTS_ID, 'createdAt', true), 'posts.createdAt');

  // Comments collection
  await safe(() => databases.createCollection(DB_ID, COMMENTS_ID, 'Comments', ['role:all'], ['role:users']), `create collection ${COMMENTS_ID}`);
  await safe(() => databases.getCollection(DB_ID, COMMENTS_ID), `verify collection ${COMMENTS_ID}`);
  await safe(() => databases.createStringAttribute(DB_ID, COMMENTS_ID, 'postId', 36, true), 'comments.postId');
  await safe(() => databases.createTextAttribute(DB_ID, COMMENTS_ID, 'text', true), 'comments.text');
  await safe(() => databases.createStringAttribute(DB_ID, COMMENTS_ID, 'authorId', 36, true), 'comments.authorId');
  await safe(() => databases.createDatetimeAttribute(DB_ID, COMMENTS_ID, 'createdAt', true), 'comments.createdAt');

  console.log('\nSetup completed. Database ID:', DB_ID);
  console.log('Collections: profiles, posts, comments');
  console.log('Remember to add DB and collection IDs to your .env.local (NEXT_PUBLIC_APPWRITE_DATABASE etc.).');
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
