import Link from 'next/link';

export default function Header() {
  return (
    <header className="bg-white border-b">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="font-bold text-xl">GitConnect</Link>
        <nav className="space-x-4">
          <Link href="/developers" className="text-gray-700">Developers</Link>
          <Link href="/posts" className="text-gray-700">Posts</Link>
          <Link href="/auth/signin" className="text-blue-600">Sign in</Link>
        </nav>
      </div>
    </header>
  );
}
