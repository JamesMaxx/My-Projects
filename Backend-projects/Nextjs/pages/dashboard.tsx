import React, { useEffect, useState } from 'react';
import { getCurrentUser, getProfileByUserId, createProfile, updateProfile } from '../lib/api';

export default function Dashboard() {
  const [profileId, setProfileId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [github, setGithub] = useState('');
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const user = await getCurrentUser();
      if (!user) return;
      const p = await getProfileByUserId(user.$id || user.id);
      if (p) {
        setProfileId(p.$id || p.id);
        setName(p.name || '');
        setBio(p.bio || '');
        setLocation(p.location || '');
        setGithub(p.githubUsername || '');
      }
    }
    load();
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setStatus('Saving...');
    try {
      const user = await getCurrentUser();
      const payload = { name, bio, location, githubUsername: github, userId: user?.$id || user?.id };
      if (profileId) {
        await updateProfile(profileId, payload);
      } else {
        await createProfile(payload);
      }
      setStatus('Profile saved.');
    } catch (err: any) {
      setStatus(err?.message || 'Failed to save');
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="text-sm text-gray-600">Edit your profile and settings here.</p>

      <form onSubmit={handleSave} className="mt-4 space-y-3">
        <input value={name} onChange={(e) => setName(e.target.value)} className="w-full border p-2" placeholder="Full name" />
        <input value={location} onChange={(e) => setLocation(e.target.value)} className="w-full border p-2" placeholder="Location" />
        <input value={github} onChange={(e) => setGithub(e.target.value)} className="w-full border p-2" placeholder="GitHub username" />
        <textarea value={bio} onChange={(e) => setBio(e.target.value)} className="w-full border p-2" placeholder="Short bio" />
        <div>
          <button className="bg-green-600 text-white px-4 py-2 rounded">Save profile</button>
        </div>
      </form>
      {status && <div className="mt-3 text-sm">{status}</div>}
    </div>
  );
}
