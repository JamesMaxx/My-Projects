import React, { useState } from 'react';
import { signIn } from '../../lib/api';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('Signing in...');
    try {
      await signIn(email, password);
      setStatus('Signed in successfully');
    } catch (err: any) {
      setStatus(err?.message || 'Sign in failed');
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white border rounded-lg p-6 shadow-sm">
        <h2 className="text-2xl font-semibold">Sign in</h2>
        <p className="text-sm text-gray-600">Sign in with your Appwrite account.</p>
        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border rounded px-3 py-2" placeholder="Email" />
          <input value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border rounded px-3 py-2" placeholder="Password" type="password" />
          <button className="bg-blue-600 text-white px-4 py-2 rounded w-full">Sign in</button>
        </form>
        {status && <div className="mt-3 text-sm text-gray-600">{status}</div>}
      </div>
    </div>
  );
}
