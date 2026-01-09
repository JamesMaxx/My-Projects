import React, { useEffect, useState } from 'react';
import PostCard from '../components/PostCard';
import { listPosts, createPost } from '../lib/api';

export default function Posts() {
  const [posts, setPosts] = useState<any[]>([]);
  const [body, setBody] = useState('');

  useEffect(() => {
    async function load() {
      const p = await listPosts();
      setPosts(p);
    }
    load();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!body) return;
    try {
      await createPost({ body, createdAt: new Date().toISOString() });
      setBody('');
      const p = await listPosts();
      setPosts(p);
    } catch (err) {
      // ignore for now
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Posts</h1>

      <form onSubmit={handleCreate} className="mb-4">
        <textarea value={body} onChange={(e) => setBody(e.target.value)} className="w-full border p-2" rows={3} placeholder="Share something..." />
        <div className="mt-2">
          <button className="bg-blue-600 text-white px-4 py-2 rounded">Post</button>
        </div>
      </form>

      <div className="space-y-4">
        {posts.length === 0 && <div className="text-sm text-gray-600">No posts yet (configure Appwrite collections).</div>}
        {posts.map((p: any) => (
          <PostCard key={p.$id || p.id} post={{ id: p.$id || p.id, author: p.author || 'Unknown', body: p.body || p.content || '' }} />
        ))}
      </div>
    </div>
  );
}
