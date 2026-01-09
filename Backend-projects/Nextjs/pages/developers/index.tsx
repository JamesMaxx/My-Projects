import React, { useEffect, useState } from 'react';
import ProfileCard from '../../components/ProfileCard';
import { listDevelopers } from '../../lib/api';

export default function Developers() {
  const [devs, setDevs] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      const d = await listDevelopers();
      setDevs(d);
    }
    load();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Developers</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {devs.length === 0 && <div className="text-sm text-gray-600">No developers yet (configure Appwrite collections).</div>}
        {devs.map((d: any) => (
          <ProfileCard key={d.$id || d.id} id={d.$id || d.id} name={d.name || d.username || 'Unnamed'} title={d.title || d.role || ''} />
        ))}
      </div>
    </div>
  );
}
