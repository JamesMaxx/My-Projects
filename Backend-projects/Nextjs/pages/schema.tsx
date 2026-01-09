import React, { useEffect, useState } from 'react';

type Column = any;

export default function SchemaPage() {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetch('/api/schema');
        const j = await res.json();
        setData(j);
      } catch (e) {
        setData({ error: String(e) });
      } finally { setLoading(false); }
    }
    load();
  }, []);

  if (loading) return <div>Checking schema...</div>;
  if (!data) return <div className="text-red-600">No schema data</div>;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Schema</h1>
      <p className="text-sm text-gray-600">Lists the current tables and their columns (via Appwrite API).</p>

      {data.tables && data.tables.map((t: any) => (
        <section key={t.id} className="bg-white border rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="font-semibold">{t.id}</div>
            {t.error && <div className="text-sm text-red-600">{t.error}</div>}
          </div>

          {t.columns && Array.isArray(t.columns) && (
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
              {t.columns.map((c: Column) => (
                <div key={c.key || c.$id || JSON.stringify(c)} className="p-2 border rounded bg-gray-50">
                  <div className="text-sm font-medium">{c.key || c.$id}</div>
                  <div className="text-xs text-gray-600">type: {c.type || c}</div>
                </div>
              ))}
            </div>
          )}
        </section>
      ))}
    </div>
  );
}
