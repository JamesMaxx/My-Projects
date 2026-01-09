import Link from 'next/link';

export default function Header() {
  return (
    <header className="bg-gray-900 text-gray-100 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-purple-600 rounded-md flex items-center justify-center font-bold text-white">GC</div>
            <div>
              <div className="font-semibold">GitConnect</div>
              <div className="text-xs text-gray-300">Developer network</div>
            </div>
          </Link>
          <div className="hidden md:block">
            <input placeholder="Search developers, posts..." className="bg-gray-800 text-sm placeholder-gray-400 px-3 py-2 rounded-md border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>

        <nav className="flex items-center gap-4">
          <Link href="/developers" className="text-sm text-gray-200 hover:text-white">Developers</Link>
          <Link href="/posts" className="text-sm text-gray-200 hover:text-white">Posts</Link>
          <Link href="/dashboard" className="text-sm text-gray-200 hover:text-white">Dashboard</Link>
          <Link href="/auth/signin" className="text-sm bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-white">Sign in</Link>
        </nav>
      </div>
    </header>
  );
}
