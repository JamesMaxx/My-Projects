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
        <>
          <section className="mt-4">
            <h2 className="font-semibold">Personal details</h2>
            <div className="mt-2">{profile.name}</div>
            <div className="text-sm text-gray-600">{profile.location}</div>
            <p className="mt-2">{profile.bio}</p>
          </section>

          <section className="mt-4">
            <h2 className="font-semibold">Education</h2>
            <div className="mt-2">{profile.education || 'Not provided'}</div>
          </section>

          <section className="mt-4">
            <h2 className="font-semibold">Experience</h2>
            <div className="mt-2">{profile.experience || 'Not provided'}</div>
          </section>

          <section className="mt-4">
            <h2 className="font-semibold">GitHub Repos</h2>
            <GitHubRepos username={profile.githubUsername} />
          </section>
        </>
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
