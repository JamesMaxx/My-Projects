import React, { useEffect, useState } from 'react';
import ProfileCard from '../../components/ProfileCard';
import { listDevelopers } from '../../lib/api';

export default function Developers() {
  const [devs, setDevs] = useState<any[]>([]);
  const [health, setHealth] = useState<any>(null);

  useEffect(() => {
    async function load() {
      const d = await listDevelopers();
      setDevs(d);
      try {
        const r = await fetch('/api/appwrite-health');
        const j = await r.json();
        setHealth(j);
      } catch (e) {
        setHealth({ error: String(e) });
      }
    }
    load();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Developers</h1>
        <div>
          {health ? (
            health.health && health.health.status === 200 ? (
              <span className="px-3 py-1 rounded bg-green-100 text-green-800 text-sm">Appwrite: OK</span>
            ) : (
              <span className="px-3 py-1 rounded bg-red-100 text-red-800 text-sm">Appwrite: Unavailable</span>
            )
          ) : (
            <span className="px-3 py-1 rounded bg-gray-100 text-gray-800 text-sm">Checking Appwrite...</span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {devs.length === 0 && <div className="text-sm text-gray-600">No developers yet (configure Appwrite collections).</div>}
        {devs.map((d: any) => (
          <ProfileCard key={d.$id || d.id} id={d.$id || d.id} name={d.name || d.username || 'Unnamed'} title={d.title || d.role || ''} />
        ))}
      </div>
    </div>
  );
}
