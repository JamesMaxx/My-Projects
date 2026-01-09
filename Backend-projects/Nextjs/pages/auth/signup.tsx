import React, { useState } from 'react';
import { signUp } from '../../lib/api';

export default function SignUp() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('Creating account...');
    try {
      await signUp(name, email, password);
      setStatus('Account created. Please sign in.');
    } catch (err: any) {
      setStatus(err?.message || 'Failed to create account');
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white border rounded-lg p-6 shadow-sm">
        <h2 className="text-2xl font-semibold">Sign up</h2>
        <p className="text-sm text-gray-600">Create an account backed by Appwrite.</p>
        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <input value={name} onChange={(e) => setName(e.target.value)} className="w-full border rounded px-3 py-2" placeholder="Name" />
          <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border rounded px-3 py-2" placeholder="Email" />
          <input value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border rounded px-3 py-2" placeholder="Password" type="password" />
          <button className="bg-green-600 text-white px-4 py-2 rounded w-full">Create account</button>
        </form>
        {status && <div className="mt-3 text-sm text-gray-600">{status}</div>}
      </div>
    </div>
  );
}
