import React, { useEffect, useState } from 'react';
import { likePost, dislikePost, listComments, createComment } from '../lib/api';

type Post = {
  id: string;
  author: string;
  body: string;
};

export default function PostCard({ post }: { post: Post }) {
  const [likes, setLikes] = useState<number>(0);
  const [dislikes, setDislikes] = useState<number>(0);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [comment, setComment] = useState('');

  useEffect(() => {
    // try to load counts from post if present
    // @ts-ignore
    setLikes(post.likes || 0);
    // @ts-ignore
    setDislikes(post.dislikes || 0);
  }, [post]);

  async function handleLike() {
    try {
      await likePost(post.id);
      setLikes((l) => l + 1);
    } catch (err) {
      // ignore
    }
  }

  async function handleDislike() {
    try {
      await dislikePost(post.id);
      setDislikes((d) => d + 1);
    } catch (err) {
      // ignore
    }
  }

  async function loadComments() {
    try {
      const c = await listComments(post.id);
      setComments(c);
    } catch (err) {
      // ignore
    }
  }

  async function handleAddComment(e: React.FormEvent) {
    e.preventDefault();
    if (!comment) return;
    try {
      await createComment(post.id, { text: comment, createdAt: new Date().toISOString() });
      setComment('');
      await loadComments();
    } catch (err) {
      // ignore
    }
  }

  return (
    <div className="border rounded p-4">
      <div className="text-sm text-gray-500">{post.author}</div>
      <div className="mt-2">{post.body}</div>
      <div className="mt-3 flex gap-3 items-center text-sm text-gray-600">
        <button onClick={handleLike} className="px-2 py-1 bg-gray-100 rounded">Like ({likes})</button>
        <button onClick={handleDislike} className="px-2 py-1 bg-gray-100 rounded">Dislike ({dislikes})</button>
        <button onClick={() => { setShowComments(!showComments); if (!showComments) loadComments(); }} className="px-2 py-1 bg-gray-100 rounded">Comments ({comments.length})</button>
      </div>

      {showComments && (
        <div className="mt-3">
          <form onSubmit={handleAddComment} className="space-y-2">
            <input value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Write a comment..." className="w-full border p-2" />
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
    </div>
  );
}
