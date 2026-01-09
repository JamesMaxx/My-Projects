import type { NextApiRequest, NextApiResponse } from 'next';

function stripV1(endpoint?: string) {
  if (!endpoint) return endpoint;
  return endpoint.replace(/\/v1\/??$/, '').replace(/\/v1$/, '').replace(/\/$/, '');
}

async function probe(url: string) {
  try {
    const res = await fetch(url, { method: 'GET' });
    const text = await res.text();
    let body: any = text;
    try { body = JSON.parse(text); } catch (e) {}
    return { status: res.status, ok: res.ok, body };
  } catch (err: any) {
    return { error: err?.message || String(err) };
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const raw = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || '';
  const endpoint = stripV1(raw) || '';

  if (!endpoint) {
    return res.status(400).json({ error: 'NEXT_PUBLIC_APPWRITE_ENDPOINT not set' });
  }

  const base = endpoint.replace(/\/$/, '');
  const health = await probe(base + '/v1/health');
  const ready = await probe(base + '/v1/health/ready');

  return res.status(200).json({ base, health, ready });
}
