import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { getProfile } from '../../lib/api';

export default function DeveloperProfile() {
  const router = useRouter();
  const { id } = router.query;
  const [profile, setProfile] = useState<any | null>(null);

  useEffect(() => {
    async function load() {
      if (!id) return;
      try {
        const p = await getProfile(id as string);
        setProfile(p);
      } catch (err) {
        // ignore
      }
    }
    load();
  }, [id]);

  return (
    <div>
      <h1 className="text-2xl font-bold">Developer Profile</h1>
      {!profile && <p className="text-sm text-gray-600">Loading...</p>}

      {profile && (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-6">
          <aside className="md:col-span-1 bg-white border rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-2xl font-semibold">{profile.name ? profile.name.charAt(0).toUpperCase() : 'U'}</div>
              <div>
                <div className="font-semibold text-lg">{profile.name}</div>
                <div className="text-sm text-gray-500">{profile.location}</div>
              </div>
            </div>
            <div className="mt-4">
              <a href={`https://github.com/${profile.githubUsername}`} target="_blank" rel="noreferrer" className="text-blue-600">@{profile.githubUsername}</a>
            </div>
          </aside>

          <main className="md:col-span-2 space-y-4">
            <section className="bg-white border rounded-lg p-4 shadow-sm">
              <h2 className="font-semibold">About</h2>
              <p className="mt-2 text-gray-700">{profile.bio || 'No bio provided.'}</p>
            </section>

            <section className="bg-white border rounded-lg p-4 shadow-sm">
              <h2 className="font-semibold">Experience</h2>
              <div className="mt-2 text-gray-700">{profile.experience || 'Not provided'}</div>
            </section>

            <section className="bg-white border rounded-lg p-4 shadow-sm">
              <h2 className="font-semibold">Education</h2>
              <div className="mt-2 text-gray-700">{profile.education || 'Not provided'}</div>
            </section>

            <section className="bg-white border rounded-lg p-4 shadow-sm">
              <h2 className="font-semibold">GitHub Repos</h2>
              <GitHubRepos username={profile.githubUsername} />
            </section>
          </main>
        </div>
      )}
    </div>
  );
}

function GitHubRepos({ username }: { username?: string }) {
  const [repos, setRepos] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      if (!username) return;
      try {
        const res = await fetch(`https://api.github.com/users/${username}/repos`);
        if (!res.ok) return;
        const data = await res.json();
        setRepos(data.slice(0, 10));
      } catch (err) {
        // ignore
      }
    }
    load();
  }, [username]);

  if (!username) return <div className="text-sm text-gray-600">No GitHub username provided.</div>;

  return (
    <div className="mt-2">
      {repos.length === 0 && <div className="text-sm text-gray-600">No repos found.</div>}
      <ul className="list-disc pl-5">
        {repos.map((r) => (
          <li key={r.id} className="mt-1">
            <a href={r.html_url} target="_blank" rel="noreferrer" className="text-blue-600">{r.full_name}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}
