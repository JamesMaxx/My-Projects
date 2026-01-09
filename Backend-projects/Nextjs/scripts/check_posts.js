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

function normalizeEndpoint(endpoint) {
  if (!endpoint) return '';
  // Remove trailing slash
  let e = endpoint.replace(/\/$/, '');
  // If it ends with /v1, strip it so we can append /v1 paths reliably
  e = e.replace(/\/v1$/, '');
  return e;
}

(async function main(){
  const env = parseDotEnv(path.join(process.cwd(), '.env.local'));
  const endpointRaw = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
  const project = process.env.NEXT_PUBLIC_APPWRITE_PROJECT || env.NEXT_PUBLIC_APPWRITE_PROJECT;
  const db = process.env.NEXT_PUBLIC_APPWRITE_DATABASE || env.NEXT_PUBLIC_APPWRITE_DATABASE;
  const postsCollection = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_POSTS || env.NEXT_PUBLIC_APPWRITE_COLLECTION_POSTS;

  if (!endpointRaw || !project || !db || !postsCollection) {
    console.error('Missing required env vars. Check .env.local for NEXT_PUBLIC_APPWRITE_ENDPOINT, NEXT_PUBLIC_APPWRITE_PROJECT, NEXT_PUBLIC_APPWRITE_DATABASE, NEXT_PUBLIC_APPWRITE_COLLECTION_POSTS');
    process.exit(2);
  }

  const base = normalizeEndpoint(endpointRaw);
  console.log('Using Appwrite base:', base);
  console.log('Project:', project, 'DB:', db, 'posts collection:', postsCollection);

  const url = `${base}/v1/databases/${encodeURIComponent(db)}/collections/${encodeURIComponent(postsCollection)}/documents`;
  console.log('Querying:', url);

  try {
    const res = await fetch(url, { method: 'GET', headers: { 'X-Appwrite-Project': project } });
    const text = await res.text();
    let body = text;
    try { body = JSON.parse(text); } catch(e){}
    console.log('Status:', res.status);
    if (res.ok) {
      if (body && Array.isArray(body.documents)) {
        console.log('Found documents:', body.documents.length);
        console.log('Sample documents (first 3):', JSON.stringify(body.documents.slice(0,3), null, 2));
      } else {
        console.log('Response body:', JSON.stringify(body, null, 2));
      }
    } else {
      console.log('Non-OK response:', JSON.stringify(body, null, 2));
    }
  } catch (err) {
    console.error('Fetch error:', err.message || err);
  }
})();
