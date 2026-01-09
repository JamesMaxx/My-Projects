import Link from 'next/link';

type Props = {
  id: string;
  name: string;
  title?: string;
};

export default function ProfileCard({ id, name, title }: Props) {
  return (
    <div className="bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-lg font-semibold text-gray-700">{name ? name.charAt(0).toUpperCase() : 'U'}</div>
        <div>
          <h3 className="font-semibold text-gray-800">{name}</h3>
          <p className="text-sm text-gray-500">{title}</p>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <Link href={`/developers/${id}`} className="text-sm text-blue-600 hover:underline">View profile</Link>
        <div className="text-xs text-gray-400">#{id?.slice(0,6)}</div>
      </div>
    </div>
  );
}
