import Link from 'next/link';

export default function Home() {
  return (
    <div className="space-y-6">
      <section className="bg-white border rounded-lg p-8 shadow-sm">
        <h1 className="text-3xl font-bold">GitConnect</h1>
        <p className="mt-3 text-gray-600">A focused community for developers — share work, follow people, and discover projects.</p>
        <div className="mt-6 flex items-center gap-4">
          <Link href="/developers" className="bg-gray-900 text-white px-4 py-2 rounded-md">Browse developers</Link>
          <Link href="/posts" className="text-gray-700 px-4 py-2 rounded-md border">See posts</Link>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 bg-white border rounded-lg p-6 shadow-sm">
          <h2 className="font-semibold text-lg">What's new</h2>
          <p className="mt-2 text-sm text-gray-600">Connect to Appwrite and start posting — the app has starter scripts to create collections and seed data.</p>
        </div>
        <aside className="bg-white border rounded-lg p-6 shadow-sm">
          <h3 className="font-semibold">Quick links</h3>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link href="/developers" className="text-blue-600">Developers</Link></li>
            <li><Link href="/posts" className="text-blue-600">Posts</Link></li>
            <li><Link href="/dashboard" className="text-blue-600">Dashboard</Link></li>
          </ul>
        </aside>
      </section>
    </div>
  );
}
