// The appwrite SDK's exported shape can differ between versions. Use a default import
// and fall back to any to ensure compatibility with the installed package here.
// @ts-ignore
import Appwrite from 'appwrite';

const AW: any = Appwrite;

const client = new AW.Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || '')
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT || '');

const account = new AW.Account(client);
const databases = new AW.Databases(client);

export { client, account, databases };
