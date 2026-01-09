#!/usr/bin/env node
/**
 * Interactive script to create tables/collections in an Appwrite database and update .env.local
 * - Prompts for APPWRITE_ENDPOINT, APPWRITE_PROJECT, APPWRITE_DATABASE, APPWRITE_KEY
 * - Prompts for collection/table IDs (defaults: profiles, posts, comments)
 * - Creates tables/collections and attributes (works with TablesDB and classic DB)
 * - Updates (or creates) .env.local with the provided values
 *
 * Usage: node scripts/create-tables-interactive.js
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
function question(q, defaultValue) {
  return new Promise((resolve) => {
    const prompt = defaultValue ? `${q} (${defaultValue}): ` : `${q}: `;
    rl.question(prompt, (ans) => {
      if (!ans && typeof defaultValue !== 'undefined') return resolve(defaultValue);
      resolve(ans.trim());
    });
  });
}

const fetch = globalThis.fetch || require('node-fetch');

function headers(project, key) {
  return {
    'Content-Type': 'application/json',
    'X-Appwrite-Project': project,
    'X-Appwrite-Key': key,
  };
}

async function fetchWithFallback(endpoint, urls, opts, name) {
  for (const u of urls) {
    try {
      console.log(`Trying ${u} for ${name}`);
      const res = await fetch(u, opts);
      if (res.status === 404) {
        console.error(`404 from ${u} during ${name}; trying fallback`);
        continue;
      }
      console.log(`Success from ${u} for ${name}: ${res.status}`);
      return res;
    } catch (e) {
      console.error(`Network error calling ${u}:`, e && e.message ? e.message : e);
      continue;
    }
  }
  throw new Error(`All endpoints failed for ${name}`);
}

async function getDbInfo(endpoint, project, key, dbId) {
  const base = endpoint.replace(/\/$/, '');
  const urls = [
    `${base}/v1/databases/${dbId}`,
    // fallback
    `${base}/v1/databases/${dbId}`
  ];
  const res = await fetchWithFallback(endpoint, urls, { headers: headers(project, key) }, `get database ${dbId}`);
  if (!res.ok) throw { status: res.status, body: await res.text() };
  return res.json();
}

async function existsClassicCollection(endpoint, project, key, dbId, collectionId) {
  const url = `${endpoint.replace(/\/$/, '')}/v1/databases/${dbId}/collections/${collectionId}`;
  const res = await fetch(url, { headers: headers(project, key) });
  return res.ok;
}

async function createClassicCollection(endpoint, project, key, dbId, collectionId, name) {
  const url = `${endpoint.replace(/\/$/, '')}/v1/databases/${dbId}/collections`;
  // Newer Appwrite versions accept permission strings in the format action("role").
  // Use action("any") for public access during setup.
  const body = { collectionId, name, permissions: ['create("any")','read("any")','update("any")','delete("any")','write("any")'], documentSecurity: false, enabled: true };
  return fetch(url, { method: 'POST', headers: headers(project, key), body: JSON.stringify(body) });
}

async function createClassicAttribute(endpoint, project, key, dbId, collectionId, type, payload) {
  const url = `${endpoint.replace(/\/$/, '')}/v1/databases/${dbId}/collections/${collectionId}/attributes/${type}`;
  return fetch(url, { method: 'POST', headers: headers(project, key), body: JSON.stringify(payload) });
}

async function existsTablesTable(endpoint, project, key, dbId, tableId) {
  const base = endpoint.replace(/\/$/, '');
  const urls = [
    `${base}/v1/tablesdb/${dbId}/tables/${tableId}`,
    `${base}/v1/databases/${dbId}/tables/${tableId}`
  ];
  try {
    const res = await fetchWithFallback(endpoint, urls, { headers: headers(project, key) }, `exists table ${tableId}`);
    return res.ok;
  } catch (e) {
    return false;
  }
}

async function createTablesTable(endpoint, project, key, dbId, tableId, name) {
  const base = endpoint.replace(/\/$/, '');
  const urls = [
    `${base}/v1/tablesdb/${dbId}/tables`,
    `${base}/v1/databases/${dbId}/tables`
  ];
  return fetchWithFallback(endpoint, urls, { method: 'POST', headers: headers(project, key), body: JSON.stringify({ tableId, name, permissions: ['create("any")','read("any")','update("any")','delete("any")','write("any")'], rowSecurity: false, enabled: true }) }, `create table ${tableId}`);
}

async function createTablesAttribute(endpoint, project, key, dbId, tableId, type, payload) {
  const base = endpoint.replace(/\/$/, '');
  // Try multiple type aliases for broader compatibility
  const typeAliases = {
    text: ['text', 'string'],
    datetime: ['datetime', 'string'],
    integer: ['integer', 'int', 'number']
  };
  const triedTypes = typeAliases[type] || [type];

  const candidatesForType = (t) => [
    `${base}/v1/tablesdb/${dbId}/tables/${tableId}/columns`,
    `${base}/v1/tablesdb/${dbId}/tables/${tableId}/columns/${t}`,
    `${base}/v1/databases/${dbId}/tables/${tableId}/columns`,
    `${base}/v1/databases/${dbId}/tables/${tableId}/columns/${t}`
  ];

  for (const t of triedTypes) {
    const bodyWithType = Object.assign({ type: t }, payload);
    const urls = candidatesForType(t);
    for (const u of urls) {
      try {
        console.log(`Trying ${u} for ${tableId}.attribute ${t}`);
        const res = await fetch(u, { method: 'POST', headers: headers(project, key), body: JSON.stringify(bodyWithType) });
        if (res.status === 404) {
          console.error(`Got 404 from ${u} while ${tableId}.attribute ${t}; trying fallback if available`);
          continue;
        }
        const txt = await res.text();
        console.log(`Response ${res.status} from ${u} for ${tableId}.attribute ${t}:`, txt);
        return { res, bodyText: txt };
      } catch (e) {
        console.error(`Network error calling ${u}:`, e && e.message ? e.message : e);
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

function upsertEnvFile(envPath, entries) {
  let content = '';
  if (fs.existsSync(envPath)) content = fs.readFileSync(envPath, 'utf8');
  const lines = content.split(/\r?\n/).filter(Boolean);
  const map = {};
  lines.forEach((l) => {
    const idx = l.indexOf('=');
    if (idx === -1) return;
    const k = l.slice(0, idx).trim();
    const v = l.slice(idx + 1).trim();
    map[k] = v;
  });
  for (const [k, v] of Object.entries(entries)) {
    map[k] = v;
  }
  const out = Object.entries(map).map(([k, v]) => `${k}=${v}`).join('\n') + '\n';
  fs.writeFileSync(envPath, out, 'utf8');
  console.log('Updated', envPath);
}

async function createAndAttributes(endpoint, project, key, dbId, isTables, id, name) {
  if (isTables) {
    const exists = await existsTablesTable(endpoint, project, key, dbId, id);
    if (exists) { console.log(`Exists: ${id}`); return; }
    console.log('Creating table:', id);
    await okOrLog(await createTablesTable(endpoint, project, key, dbId, id, name), `create table ${id}`);
  } else {
    const exists = await existsClassicCollection(endpoint, project, key, dbId, id);
    if (exists) { console.log(`Exists: ${id}`); return; }
    console.log('Creating collection:', id);
    await okOrLog(await createClassicCollection(endpoint, project, key, dbId, id, name), `create collection ${id}`);
  }
}

async function createAttributesFor(endpoint, project, key, dbId, isTables, id, attributes) {
  for (const attr of attributes) {
    const { type, payload, name } = attr;
    if (isTables) {
      await okOrLog(await createTablesAttribute(endpoint, project, key, dbId, id, type, payload), `${id}.${name}`);
    } else {
      await okOrLog(await createClassicAttribute(endpoint, project, key, dbId, id, type, payload), `${id}.${name}`);
    }
  }
}

(async function main() {
  try {
    const defaultEndpoint = (process.env.APPWRITE_ENDPOINT || process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || '').replace(/\/$/, '') || 'https://fra.cloud.appwrite.io';
    const endpoint = await question('Appwrite endpoint', defaultEndpoint);
    const project = await question('Project ID', process.env.APPWRITE_PROJECT || process.env.NEXT_PUBLIC_APPWRITE_PROJECT || '');
    const dbId = await question('Database ID', process.env.APPWRITE_DATABASE || process.env.NEXT_PUBLIC_APPWRITE_DATABASE || '');
    const key = await question('Appwrite admin/API Key (will be written to .env.local)', process.env.APPWRITE_KEY || '');
    const profilesId = await question('Profiles table id', 'profiles');
    const postsId = await question('Posts table id', 'posts');
    const commentsId = await question('Comments table id', 'comments');

    rl.close();

    console.log('\nChecking database...');
    let info;
    try {
      info = await getDbInfo(endpoint, project, key, dbId);
    } catch (e) {
      console.error('Failed to fetch database info:', e);
      process.exit(1);
    }
    console.log('Database type:', info.type || 'database');
    const isTables = (info.type === 'tablesdb');

    // Create/ensure tables
    await createAndAttributes(endpoint, project, key, dbId, isTables, profilesId, 'Profiles');
    await createAttributesFor(endpoint, project, key, dbId, isTables, profilesId, [
      { type: isTables ? 'string' : 'string', payload: { key: 'name', size: 128, required: true }, name: 'name' },
      { type: isTables ? 'text' : 'text', payload: { key: 'bio', required: false }, name: 'bio' },
      { type: isTables ? 'string' : 'string', payload: { key: 'location', size: 64, required: false }, name: 'location' },
      { type: isTables ? 'string' : 'string', payload: { key: 'githubUsername', size: 39, required: false }, name: 'githubUsername' },
      { type: isTables ? 'string' : 'string', payload: { key: 'userId', size: 36, required: true }, name: 'userId' },
      { type: isTables ? 'text' : 'text', payload: { key: 'education', required: false }, name: 'education' },
      { type: isTables ? 'text' : 'text', payload: { key: 'experience', required: false }, name: 'experience' },
    ]);

    await createAndAttributes(endpoint, project, key, dbId, isTables, postsId, 'Posts');
    await createAttributesFor(endpoint, project, key, dbId, isTables, postsId, [
      { type: isTables ? 'text' : 'text', payload: { key: 'body', required: true }, name: 'body' },
      { type: isTables ? 'string' : 'string', payload: { key: 'author', size: 128, required: true }, name: 'author' },
      { type: isTables ? 'string' : 'string', payload: { key: 'authorId', size: 36, required: true }, name: 'authorId' },
      { type: isTables ? 'integer' : 'integer', payload: { key: 'likes', required: false }, name: 'likes' },
      { type: isTables ? 'integer' : 'integer', payload: { key: 'dislikes', required: false }, name: 'dislikes' },
      { type: isTables ? 'datetime' : 'datetime', payload: { key: 'createdAt', required: true }, name: 'createdAt' },
    ]);

    await createAndAttributes(endpoint, project, key, dbId, isTables, commentsId, 'Comments');
    await createAttributesFor(endpoint, project, key, dbId, isTables, commentsId, [
      { type: isTables ? 'string' : 'string', payload: { key: 'postId', size: 36, required: true }, name: 'postId' },
      { type: isTables ? 'text' : 'text', payload: { key: 'text', required: true }, name: 'text' },
      { type: isTables ? 'string' : 'string', payload: { key: 'authorId', size: 36, required: true }, name: 'authorId' },
      { type: isTables ? 'datetime' : 'datetime', payload: { key: 'createdAt', required: true }, name: 'createdAt' },
    ]);

    // Update .env.local
    const envPath = path.join(process.cwd(), '.env.local');
    upsertEnvFile(envPath, {
      APPWRITE_ENDPOINT: endpoint.endsWith('/') ? endpoint : endpoint + '/',
      NEXT_PUBLIC_APPWRITE_ENDPOINT: endpoint.endsWith('/') ? endpoint : endpoint + '/',
      APPWRITE_PROJECT: project,
      NEXT_PUBLIC_APPWRITE_PROJECT: project,
      APPWRITE_DATABASE: dbId,
      NEXT_PUBLIC_APPWRITE_DATABASE: dbId,
      APPWRITE_COLLECTION_PROFILES: profilesId,
      APPWRITE_COLLECTION_POSTS: postsId,
      APPWRITE_COLLECTION_COMMENTS: commentsId,
      NEXT_PUBLIC_APPWRITE_COLLECTION_PROFILES: profilesId,
      NEXT_PUBLIC_APPWRITE_COLLECTION_POSTS: postsId,
      NEXT_PUBLIC_APPWRITE_COLLECTION_COMMENTS: commentsId,
      APPWRITE_KEY: key,
    });

    console.log('\nAll done. .env.local updated and tables ensured.');
  } catch (err) {
    console.error('Fatal error:', err);
  }
})();
