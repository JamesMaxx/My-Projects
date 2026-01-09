import Link from 'next/link';

export default function Home() {
  return (
    <div>
      <h1 className="text-3xl font-bold">GitConnect</h1>
      <p className="mt-4">A social network for developers (starter scaffold).</p>
      <div className="mt-6 space-x-3">
        <Link href="/developers" className="text-blue-600">Developers</Link>
        <Link href="/posts" className="text-blue-600">Posts</Link>
      </div>
    </div>
  );
}
