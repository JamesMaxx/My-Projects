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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Posts</h1>
        <div className="text-sm text-gray-500">{posts.length} posts</div>
      </div>

      <form onSubmit={handleCreate} className="bg-white border rounded-lg p-4 shadow-sm">
        <textarea value={body} onChange={(e) => setBody(e.target.value)} className="w-full border rounded px-3 py-2" rows={3} placeholder="Share an update with the community..." />
        <div className="mt-3 flex justify-end">
          <button className="bg-blue-600 text-white px-4 py-2 rounded">Post</button>
        </div>
      </form>

      <div className="grid grid-cols-1 gap-4">
        {posts.length === 0 && <div className="text-sm text-gray-600">No posts yet (configure Appwrite collections).</div>}
        {posts.map((p: any) => (
          <PostCard key={p.$id || p.id} post={{ id: p.$id || p.id, author: p.author || 'Unknown', body: p.body || p.content || '', createdAt: p.$createdAt || p.createdAt }} />
        ))}
      </div>
    </div>
  );
}
