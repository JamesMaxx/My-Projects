import type { NextApiRequest, NextApiResponse } from 'next';

const ENDPOINT = process.env.APPWRITE_ENDPOINT || process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
const PROJECT = process.env.APPWRITE_PROJECT || process.env.NEXT_PUBLIC_APPWRITE_PROJECT;
const DB = process.env.APPWRITE_DATABASE || process.env.NEXT_PUBLIC_APPWRITE_DATABASE;
const KEY = process.env.APPWRITE_KEY;

function headers() {
  return {
    'X-Appwrite-Project': PROJECT || '',
    'X-Appwrite-Key': KEY || '',
  } as Record<string,string>;
}

async function fetchWithCandidates(urls: string[]) {
  for (const u of urls) {
    try {
      const res = await fetch(u, { headers: { ...headers() } });
      if (res.status === 404) continue;
      const text = await res.text();
      try { return JSON.parse(text); } catch (e) { return text; }
    } catch (e) {
      continue;
    }
  }
  throw new Error('No endpoints available');
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!ENDPOINT || !PROJECT || !DB) return res.status(400).json({ error: 'Missing APPWRITE_ENDPOINT/PROJECT/DATABASE in env' });

  // Table IDs to inspect from env (common defaults)
  const tables = [
    process.env.APPWRITE_COLLECTION_PROFILES || process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_PROFILES || 'profiles',
    process.env.APPWRITE_COLLECTION_POSTS || process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_POSTS || 'posts',
    process.env.APPWRITE_COLLECTION_COMMENTS || process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_COMMENTS || 'comments',
  ];

  const base = (ENDPOINT || '').replace(/\/$/, '');

  const out: any = { tables: [] };

  for (const t of tables) {
    const candidates = [
      `${base}/v1/tablesdb/${DB}/tables/${t}/columns`,
      `${base}/v1/databases/${DB}/tables/${t}/columns`,
      // some deployments accept listing columns by GET on columns/{type} patterns but we've seen the above work
    ];
    try {
      const body = await fetchWithCandidates(candidates);
      out.tables.push({ id: t, columns: body });
    } catch (e: any) {
      out.tables.push({ id: t, error: String(e) });
    }
  }

  return res.status(200).json(out);
}
