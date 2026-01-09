#!/usr/bin/env node
/*
 * scripts/ensure-collections.js
 *
 * Small idempotent script to read Appwrite vars from env or .env.local,
 * check that collections exist (profiles, posts, comments) and create them
 * with minimal attributes if they are missing.
 *
 * Usage:
 *   node scripts/ensure-collections.js
 * or with env inline:
 *   APPWRITE_KEY=... node scripts/ensure-collections.js
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

const repoEnv = parseDotEnv(path.join(process.cwd(), '.env.local'));

const ENDPOINT = process.env.APPWRITE_ENDPOINT || process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || repoEnv.APPWRITE_ENDPOINT || repoEnv.NEXT_PUBLIC_APPWRITE_ENDPOINT;
const PROJECT = process.env.APPWRITE_PROJECT || process.env.NEXT_PUBLIC_APPWRITE_PROJECT || repoEnv.APPWRITE_PROJECT || repoEnv.NEXT_PUBLIC_APPWRITE_PROJECT;
const KEY = process.env.APPWRITE_KEY || repoEnv.APPWRITE_KEY;
const DB_ID = process.env.APPWRITE_DATABASE || process.env.NEXT_PUBLIC_APPWRITE_DATABASE || repoEnv.APPWRITE_DATABASE || repoEnv.NEXT_PUBLIC_APPWRITE_DATABASE;
const PROFILES_ID = process.env.APPWRITE_COLLECTION_PROFILES || process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_PROFILES || repoEnv.APPWRITE_COLLECTION_PROFILES || repoEnv.NEXT_PUBLIC_APPWRITE_COLLECTION_PROFILES || 'profiles';
const POSTS_ID = process.env.APPWRITE_COLLECTION_POSTS || process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_POSTS || repoEnv.APPWRITE_COLLECTION_POSTS || repoEnv.NEXT_PUBLIC_APPWRITE_COLLECTION_POSTS || 'posts';
const COMMENTS_ID = process.env.APPWRITE_COLLECTION_COMMENTS || process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_COMMENTS || repoEnv.APPWRITE_COLLECTION_COMMENTS || repoEnv.NEXT_PUBLIC_APPWRITE_COLLECTION_COMMENTS || 'comments';

if (!ENDPOINT || !PROJECT || !KEY || !DB_ID) {
  console.error('Missing required Appwrite config. Please set APPWRITE_ENDPOINT, APPWRITE_PROJECT, APPWRITE_KEY, and APPWRITE_DATABASE (or place them in .env.local).');
  process.exit(1);
}

// We'll use the built-in fetch (Node 18+) to call Appwrite HTTP API directly. This avoids SDK mismatches
// across Appwrite versions (classic Databases vs new TablesDB).
const fetch = globalThis.fetch || require('node-fetch');

function headers() {
  return {
    'Content-Type': 'application/json',
    'X-Appwrite-Project': PROJECT,
    'X-Appwrite-Key': KEY,
  };
}

async function fetchWithFallback(urls, opts, name) {
  // urls: array of URLs to try in order. opts: fetch options.
  for (const url of urls) {
    try {
      console.log(`Trying ${url} for ${name}`);
      const res = await fetch(url, opts);
      // If route not found, try next
      if (res.status === 404) {
        // attempt to read body to detect general_route_not_found
        let bodyText = '';
        try { bodyText = await res.text(); } catch (e) {}
        // if it's a route-not-found style or generic 404, we'll try fallback
        console.error(`Got 404 from ${url} while ${name}; trying fallback if available`);
        continue;
      }
      // Log a success status and which url responded
      console.log(`Success from ${url} for ${name}: ${res.status}`);
      return res;
    } catch (err) {
      // network error, log and try next
      console.error(`Network error calling ${url}:`, err && err.message ? err.message : err);
      continue;
    }
  }
  // If all attempts failed, throw a generic error
  throw new Error(`All endpoints failed for ${name}`);
}

async function getDbInfo() {
  const urls = [
    `${ENDPOINT.replace(/\/$/, '')}/v1/databases/${DB_ID}`,
    // fallback (unlikely) -- same endpoint format but keep for symmetry
    `${ENDPOINT.replace(/\/$/, '')}/v1/databases/${DB_ID}`
  ];
  const res = await fetchWithFallback(urls, { headers: headers() }, `get database ${DB_ID}`);
  if (!res.ok) {
    const txt = await res.text();
    const err = { status: res.status, body: txt };
    throw err;
  }
  return res.json();
}

async function existsClassicCollection(collectionId) {
  const url = `${ENDPOINT.replace(/\/$/, '')}/v1/databases/${DB_ID}/collections/${collectionId}`;
  const res = await fetch(url, { headers: headers() });
  return res.ok;
}

async function createClassicCollection(collectionId, name) {
  const url = `${ENDPOINT.replace(/\/$/, '')}/v1/databases/${DB_ID}/collections`;
  // Newer Appwrite versions accept permission strings in the format action("role").
  // Use action("any") for public access during setup.
  const body = { collectionId, name, permissions: ['create("any")','read("any")','update("any")','delete("any")','write("any")'], documentSecurity: false, enabled: true };
  const res = await fetch(url, { method: 'POST', headers: headers(), body: JSON.stringify(body) });
  return res;
}

async function createClassicAttribute(collectionId, type, payload) {
  const url = `${ENDPOINT.replace(/\/$/, '')}/v1/databases/${DB_ID}/collections/${collectionId}/attributes/${type}`;
  const res = await fetch(url, { method: 'POST', headers: headers(), body: JSON.stringify(payload) });
  return res;
}

async function existsTablesTable(tableId) {
  const base = ENDPOINT.replace(/\/$/, '');
  const candidates = [
    `${base}/v1/tablesdb/${DB_ID}/tables/${tableId}`,
    // fallback: some Appwrite deployments expose tables under /v1/databases/{db}/tables
    `${base}/v1/databases/${DB_ID}/tables/${tableId}`
  ];
  try {
    const res = await fetchWithFallback(candidates, { headers: headers() }, `exists table ${tableId}`);
    return res.ok;
  } catch (e) {
    return false;
  }
}

async function createTablesTable(tableId, name) {
  const base = ENDPOINT.replace(/\/$/, '');
  const candidates = [
    `${base}/v1/tablesdb/${DB_ID}/tables`,
    `${base}/v1/databases/${DB_ID}/tables`
  ];
  return fetchWithFallback(candidates, { method: 'POST', headers: headers(), body: JSON.stringify({ tableId, name, permissions: ['create("any")','read("any")','update("any")','delete("any")','write("any")'], rowSecurity: false, enabled: true }) }, `create table ${tableId}`);
}

async function createTablesAttribute(tableId, type, payload) {
  const base = ENDPOINT.replace(/\/$/, '');
  // Try multiple candidate routes and type aliases. Some Appwrite deployments
  // use different type names for text-like columns.
  const typeAliases = {
    text: ['text', 'string'],
    datetime: ['datetime', 'string'],
    integer: ['integer', 'int', 'number']
  };
  const triedTypes = typeAliases[type] || [type];

  const candidatesForType = (t) => [
    `${base}/v1/tablesdb/${DB_ID}/tables/${tableId}/columns`,
    `${base}/v1/tablesdb/${DB_ID}/tables/${tableId}/columns/${t}`,
    `${base}/v1/databases/${DB_ID}/tables/${tableId}/columns`,
    `${base}/v1/databases/${DB_ID}/tables/${tableId}/columns/${t}`
  ];

  for (const t of triedTypes) {
    const bodyWithType = Object.assign({ type: t }, payload);
    const candidates = candidatesForType(t);
    for (const url of candidates) {
      try {
        console.log(`Trying ${url} for ${tableId}.attribute ${t}`);
        const res = await fetch(url, { method: 'POST', headers: headers(), body: JSON.stringify(bodyWithType) });
        if (res.status === 404) {
          console.error(`Got 404 from ${url} while ${tableId}.attribute ${t}; trying fallback if available`);
          continue;
        }
  // log response body (useful for validation errors)
  const txt = await res.text();
  console.log(`Response ${res.status} from ${url} for ${tableId}.attribute ${t}:`, txt);
  return res;
      } catch (err) {
        console.error(`Network error calling ${url}:`, err && err.message ? err.message : err);
        continue;
      }
    }
  }
  throw new Error(`All endpoints failed for ${tableId}.attribute ${type}`);
}

async function okOrLog(res, name) {
  if (res.ok) {
    console.log(`OK: ${name}`);
    return true;
  }
  const text = await res.text();
  console.error(`Error ${res.status} during ${name}:`, text);
  return false;
}

async function ensureClassic() {
  // Profiles
  const pExists = await existsClassicCollection(PROFILES_ID);
  if (pExists) console.log(`Exists: ${PROFILES_ID}`);
  else {
    console.log('Creating collection:', PROFILES_ID);
    await okOrLog(await createClassicCollection(PROFILES_ID, 'Profiles'), `create collection ${PROFILES_ID}`);
    await okOrLog(await createClassicAttribute(PROFILES_ID, 'string', { key: 'name', size: 128, required: true }), 'profiles.name');
    await okOrLog(await createClassicAttribute(PROFILES_ID, 'text', { key: 'bio', required: false }), 'profiles.bio');
    await okOrLog(await createClassicAttribute(PROFILES_ID, 'string', { key: 'location', size: 64, required: false }), 'profiles.location');
    await okOrLog(await createClassicAttribute(PROFILES_ID, 'string', { key: 'githubUsername', size: 39, required: false }), 'profiles.githubUsername');
    await okOrLog(await createClassicAttribute(PROFILES_ID, 'string', { key: 'userId', size: 36, required: true }), 'profiles.userId');
    await okOrLog(await createClassicAttribute(PROFILES_ID, 'text', { key: 'education', required: false }), 'profiles.education');
    await okOrLog(await createClassicAttribute(PROFILES_ID, 'text', { key: 'experience', required: false }), 'profiles.experience');
  }

  // Posts
  const postsExists = await existsClassicCollection(POSTS_ID);
  if (postsExists) console.log(`Exists: ${POSTS_ID}`);
  else {
    console.log('Creating collection:', POSTS_ID);
    await okOrLog(await createClassicCollection(POSTS_ID, 'Posts'), `create collection ${POSTS_ID}`);
    await okOrLog(await createClassicAttribute(POSTS_ID, 'text', { key: 'body', required: true }), 'posts.body');
    await okOrLog(await createClassicAttribute(POSTS_ID, 'string', { key: 'author', size: 128, required: true }), 'posts.author');
    await okOrLog(await createClassicAttribute(POSTS_ID, 'string', { key: 'authorId', size: 36, required: true }), 'posts.authorId');
    await okOrLog(await createClassicAttribute(POSTS_ID, 'integer', { key: 'likes', required: false }), 'posts.likes');
    await okOrLog(await createClassicAttribute(POSTS_ID, 'integer', { key: 'dislikes', required: false }), 'posts.dislikes');
    await okOrLog(await createClassicAttribute(POSTS_ID, 'datetime', { key: 'createdAt', required: true }), 'posts.createdAt');
  }

  // Comments
  const commentsExists = await existsClassicCollection(COMMENTS_ID);
  if (commentsExists) console.log(`Exists: ${COMMENTS_ID}`);
  else {
    console.log('Creating collection:', COMMENTS_ID);
    await okOrLog(await createClassicCollection(COMMENTS_ID, 'Comments'), `create collection ${COMMENTS_ID}`);
    await okOrLog(await createClassicAttribute(COMMENTS_ID, 'string', { key: 'postId', size: 36, required: true }), 'comments.postId');
    await okOrLog(await createClassicAttribute(COMMENTS_ID, 'text', { key: 'text', required: true }), 'comments.text');
    await okOrLog(await createClassicAttribute(COMMENTS_ID, 'string', { key: 'authorId', size: 36, required: true }), 'comments.authorId');
    await okOrLog(await createClassicAttribute(COMMENTS_ID, 'datetime', { key: 'createdAt', required: true }), 'comments.createdAt');
  }
}

async function ensureTables() {
  // Profiles table: create table if missing, then ensure attributes
  const pExists = await existsTablesTable(PROFILES_ID);
  if (pExists) console.log(`Exists: ${PROFILES_ID}`);
  else {
    console.log('Creating table:', PROFILES_ID);
    await okOrLog(await createTablesTable(PROFILES_ID, 'Profiles'), `create table ${PROFILES_ID}`);
  }
  // Ensure attributes (try to create; okOrLog will show if already exists or errors)
  try { await okOrLog(await createTablesAttribute(PROFILES_ID, 'string', { key: 'name', size: 128, required: true }), 'profiles.name'); } catch (e) { console.error(e.message || e); }
  try { await okOrLog(await createTablesAttribute(PROFILES_ID, 'text', { key: 'bio', required: false }), 'profiles.bio'); } catch (e) { console.error(e.message || e); }
  try { await okOrLog(await createTablesAttribute(PROFILES_ID, 'string', { key: 'location', size: 64, required: false }), 'profiles.location'); } catch (e) { console.error(e.message || e); }
  try { await okOrLog(await createTablesAttribute(PROFILES_ID, 'string', { key: 'githubUsername', size: 39, required: false }), 'profiles.githubUsername'); } catch (e) { console.error(e.message || e); }
  try { await okOrLog(await createTablesAttribute(PROFILES_ID, 'string', { key: 'userId', size: 36, required: true }), 'profiles.userId'); } catch (e) { console.error(e.message || e); }
  try { await okOrLog(await createTablesAttribute(PROFILES_ID, 'text', { key: 'education', required: false }), 'profiles.education'); } catch (e) { console.error(e.message || e); }
  try { await okOrLog(await createTablesAttribute(PROFILES_ID, 'text', { key: 'experience', required: false }), 'profiles.experience'); } catch (e) { console.error(e.message || e); }

  // Posts
  const postsExists = await existsTablesTable(POSTS_ID);
  if (postsExists) console.log(`Exists: ${POSTS_ID}`);
  else {
    console.log('Creating table:', POSTS_ID);
    await okOrLog(await createTablesTable(POSTS_ID, 'Posts'), `create table ${POSTS_ID}`);
  }
  try { await okOrLog(await createTablesAttribute(POSTS_ID, 'text', { key: 'body', required: true }), 'posts.body'); } catch (e) { console.error(e.message || e); }
  try { await okOrLog(await createTablesAttribute(POSTS_ID, 'string', { key: 'author', size: 128, required: true }), 'posts.author'); } catch (e) { console.error(e.message || e); }
  try { await okOrLog(await createTablesAttribute(POSTS_ID, 'string', { key: 'authorId', size: 36, required: true }), 'posts.authorId'); } catch (e) { console.error(e.message || e); }
  try { await okOrLog(await createTablesAttribute(POSTS_ID, 'integer', { key: 'likes', required: false }), 'posts.likes'); } catch (e) { console.error(e.message || e); }
  try { await okOrLog(await createTablesAttribute(POSTS_ID, 'integer', { key: 'dislikes', required: false }), 'posts.dislikes'); } catch (e) { console.error(e.message || e); }
  try { await okOrLog(await createTablesAttribute(POSTS_ID, 'datetime', { key: 'createdAt', required: true }), 'posts.createdAt'); } catch (e) { console.error(e.message || e); }

  // Comments
  const commentsExists = await existsTablesTable(COMMENTS_ID);
  if (commentsExists) console.log(`Exists: ${COMMENTS_ID}`);
  else {
    console.log('Creating table:', COMMENTS_ID);
    await okOrLog(await createTablesTable(COMMENTS_ID, 'Comments'), `create table ${COMMENTS_ID}`);
  }
  try { await okOrLog(await createTablesAttribute(COMMENTS_ID, 'string', { key: 'postId', size: 36, required: true }), 'comments.postId'); } catch (e) { console.error(e.message || e); }
  try { await okOrLog(await createTablesAttribute(COMMENTS_ID, 'text', { key: 'text', required: true }), 'comments.text'); } catch (e) { console.error(e.message || e); }
  try { await okOrLog(await createTablesAttribute(COMMENTS_ID, 'string', { key: 'authorId', size: 36, required: true }), 'comments.authorId'); } catch (e) { console.error(e.message || e); }
  try { await okOrLog(await createTablesAttribute(COMMENTS_ID, 'datetime', { key: 'createdAt', required: true }), 'comments.createdAt'); } catch (e) { console.error(e.message || e); }
}

async function ensureCollections() {
  console.log('Appwrite endpoint:', ENDPOINT.replace(/\/$/, ''), 'project:', PROJECT, 'database:', DB_ID);
  let info;
  try {
    info = await getDbInfo();
  } catch (err) {
    console.error('Not found: get database', DB_ID);
    console.error('Database not found or inaccessible. Ensure APPWRITE_KEY has permissions and the database id is correct.');
    process.exit(1);
  }

  const dbType = info.type || 'database';
  console.log('Database type:', dbType);
  if (dbType === 'tablesdb') {
    await ensureTables();
  } else {
    await ensureClassic();
  }

  console.log('\nDone. Collections/tables ensured (profiles, posts, comments).');
}

ensureCollections().catch((err) => {
  console.error('Fatal:', err && err.message ? err.message : err);
  try { console.error('Details:', JSON.stringify(err, Object.getOwnPropertyNames(err), 2)); } catch (e) {}
  process.exit(1);
});
