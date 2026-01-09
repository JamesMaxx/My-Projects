import Link from 'next/link';

function Icon({ name }: { name: string }) {
  // Minimal inline icons to avoid external deps
  switch (name) {
    case 'overview':
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 13h8V3H3v10zM13 21h8V11h-8v10z"></path></svg>
      );
    case 'people':
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-1a4 4 0 00-3-3.87M9 20H4v-1a4 4 0 013-3.87M15 11a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
      );
    case 'posts':
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16h8M8 12h8M8 8h8M4 20h16V4H4v16z"></path></svg>
      );
    case 'dashboard':
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3v18h18V3H3zm6 14H6v-4h3v4zm0-6H6V7h3v4zm6 6h-4v-8h4v8zm0-10h-4V5h4v4z"></path></svg>
      );
    case 'schema':
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
      );
    default:
      return null;
  }
}

export default function Sidebar() {
  return (
    <aside className="hidden md:block w-64 flex-shrink-0">
      <div className="sticky top-20 space-y-3">
        <nav className="bg-white border rounded-lg p-3 space-y-1 shadow-sm">
          <Link href="/dashboard" className="flex items-center gap-3 px-2 py-2 rounded hover:bg-gray-50">
            <Icon name="overview" />
            <span className="text-sm font-medium">Overview</span>
          </Link>
          <Link href="/developers" className="flex items-center gap-3 px-2 py-2 rounded hover:bg-gray-50">
            <Icon name="people" />
            <span className="text-sm font-medium">Developers</span>
          </Link>
          <Link href="/posts" className="flex items-center gap-3 px-2 py-2 rounded hover:bg-gray-50">
            <Icon name="posts" />
            <span className="text-sm font-medium">Posts</span>
          </Link>
          <Link href="/schema" className="flex items-center gap-3 px-2 py-2 rounded hover:bg-gray-50">
            <Icon name="schema" />
            <span className="text-sm font-medium">Schema</span>
          </Link>
          <Link href="/dashboard" className="flex items-center gap-3 px-2 py-2 rounded hover:bg-gray-50">
            <Icon name="dashboard" />
            <span className="text-sm font-medium">Dashboard</span>
          </Link>
        </nav>
      </div>
    </aside>
  );
}
