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
    // Remove surrounding quotes if present
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    out[k] = v;
  });
  return out;
}

(async function main() {
  try {
    const repoEnv = parseDotEnv(path.join(process.cwd(), '.env.local'));
    const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || repoEnv.NEXT_PUBLIC_APPWRITE_ENDPOINT;
    const project = process.env.NEXT_PUBLIC_APPWRITE_PROJECT || repoEnv.NEXT_PUBLIC_APPWRITE_PROJECT;

    if (!endpoint) {
      console.error('NEXT_PUBLIC_APPWRITE_ENDPOINT not set in env or .env.local');
      process.exit(2);
    }

    const base = endpoint.replace(/\/$/, '');
    console.log('Using Appwrite endpoint:', base);
    if (project) console.log('Project id:', project);

    const healthUrl = base + '/v1/health';
    const readyUrl = base + '/v1/health/ready';

    async function probe(url) {
      try {
        const res = await fetch(url, { method: 'GET' });
        const text = await res.text();
        let body = text;
        try { body = JSON.parse(text); } catch (e) {}
        return { status: res.status, ok: res.ok, body };
      } catch (err) {
        return { error: err.message || String(err) };
      }
    }

    console.log('\nProbing health endpoints...');
    const h = await probe(healthUrl);
    console.log('/v1/health ->', h);

    const r = await probe(readyUrl);
    console.log('/v1/health/ready ->', r);

    // Try a read-only collection documents list if project is set
    if (project) {
      const sampleUrl = `${base}/v1/databases/${encodeURIComponent(project)}/collections`;
      // Note: the public API for listing collections requires an API key/socket; this will likely 401.
      // We'll still probe the project info endpoint which is public in some setups: /v1/projects/{project}
      const projectUrl = `${base}/v1/projects/${encodeURIComponent(project)}`;
      const p = await probe(projectUrl);
      console.log(`/v1/projects/${project} ->`, p);
    }

    console.log('\nDone. If health endpoints returned status 200/OK, the Appwrite endpoint is reachable.');
  } catch (err) {
    console.error('Fatal check error:', err);
    process.exit(1);
  }
})();
