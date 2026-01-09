import Link from 'next/link';

type Props = {
  id: string;
  name: string;
  title?: string;
};

export default function ProfileCard({ id, name, title }: Props) {
  return (
    <div className="border rounded p-4">
      <h3 className="font-semibold">{name}</h3>
      <p className="text-sm text-gray-600">{title}</p>
      <div className="mt-3">
        <Link href={`/developers/${id}`} className="text-blue-600">View profile</Link>
      </div>
    </div>
  );
}
