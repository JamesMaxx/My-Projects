// The Appwrite SDK's exported shape can differ between versions (default export vs named
// exports). Use a tolerant import pattern that works in both cases and keeps TypeScript
// happy by avoiding direct named imports of runtime values that may not exist.
// We'll prefer the default import when available, then fall back to a namespace import.
// Some versions of the Appwrite SDK export a class named `Appwrite` that
// exposes `account`, `database`, etc. To be robust across versions we use a
// runtime require and then instantiate the exported constructor when present.
let pkg: any;
try {
  // Use require at runtime to avoid TS module interop issues across environments.
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  pkg = require('appwrite');
} catch (e) {
  pkg = undefined;
}

const AppwriteCtor = pkg?.Appwrite || pkg?.default || pkg;

if (!AppwriteCtor) {
  throw new Error('Appwrite SDK not found. Make sure `appwrite` is installed.');
}

// Instantiate SDK client
const client: any = new AppwriteCtor()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || '')
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT || '');

// The modern SDK exposes service facades on the instance
const account: any = client.account || client.Account || null;
const databases: any = client.database || client.databases || client.Databases || null;

export { client, account, databases };
