import React, { useEffect, useState } from 'react';
import { likePost, dislikePost, listComments, createComment } from '../lib/api';

type Post = {
  id: string;
  author: string;
  body: string;
  createdAt?: string;
  likes?: number;
  dislikes?: number;
};

export default function PostCard({ post }: { post: Post }) {
  const [likes, setLikes] = useState<number>(0);
  const [dislikes, setDislikes] = useState<number>(0);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [comment, setComment] = useState('');

  useEffect(() => {
    setLikes((post as any).likes || 0);
    setDislikes((post as any).dislikes || 0);
  }, [post]);

  async function handleLike() {
    try {
      await likePost(post.id);
      setLikes((l) => l + 1);
    } catch (err) {}
  }

  async function handleDislike() {
    try {
      await dislikePost(post.id);
      setDislikes((d) => d + 1);
    } catch (err) {}
  }

  async function loadComments() {
    try {
      const c = await listComments(post.id);
      setComments(c);
    } catch (err) {}
  }

  async function handleAddComment(e: React.FormEvent) {
    e.preventDefault();
    if (!comment) return;
    try {
      await createComment(post.id, { text: comment, createdAt: new Date().toISOString() });
      setComment('');
      await loadComments();
    } catch (err) {}
  }

  return (
    <article className="bg-white shadow-sm border rounded-lg p-5 hover:shadow-md transition">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium text-gray-700">{(post.author || 'U').slice(0,1)}</div>
            <div>
              <div className="text-sm font-medium text-gray-800">{post.author}</div>
              <div className="text-xs text-gray-500">{(post as any).createdAt ? new Date((post as any).createdAt).toLocaleString() : ''}</div>
            </div>
          </div>
        </div>
        <div className="text-sm text-gray-500">#{post.id?.slice(0,6)}</div>
      </div>

      <div className="mt-3 text-gray-800 whitespace-pre-wrap">{post.body}</div>

      <div className="mt-4 flex items-center gap-3 text-sm">
        <button onClick={handleLike} className="flex items-center gap-2 px-3 py-1 rounded bg-gray-100 hover:bg-gray-200">👍 <span>{likes}</span></button>
        <button onClick={handleDislike} className="flex items-center gap-2 px-3 py-1 rounded bg-gray-100 hover:bg-gray-200">👎 <span>{dislikes}</span></button>
        <button onClick={() => { setShowComments(!showComments); if (!showComments) loadComments(); }} className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200">Comments ({comments.length})</button>
      </div>

      {showComments && (
        <div className="mt-4">
          <form onSubmit={handleAddComment} className="space-y-2">
            <input value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Write a comment..." className="w-full border rounded px-3 py-2" />
            <div>
              <button className="bg-blue-600 text-white px-3 py-1 rounded">Comment</button>
            </div>
          </form>

          <div className="mt-3 space-y-2">
            {comments.length === 0 && <div className="text-sm text-gray-600">No comments yet.</div>}
            {comments.map((c) => (
              <div key={c.$id || c.id} className="border rounded p-2 bg-gray-50">
                <div className="text-sm text-gray-700">{c.text}</div>
                <div className="text-xs text-gray-500">{new Date(c.createdAt).toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}
