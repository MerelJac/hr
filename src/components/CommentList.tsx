"use client";
import { useState, useEffect } from "react";

export default function CommentList({
  recognitionId,
  users,
  currentUserId,
}: any) {
  const [comments, setComments] = useState<any[]>([]);
  const [message, setMessage] = useState("");
  const [points, setPoints] = useState(0);
  const [recipientId, setRecipientId] = useState("");

  useEffect(() => {
    fetch(`/api/comments?recognitionId=${recognitionId}`)
      .then((res) => res.json())
      .then(setComments);
  }, [recognitionId]);

  async function submitComment() {
    const res = await fetch("/api/comments", {
      method: "POST",
      body: JSON.stringify({
        recognitionId,
        recipientId,
        message,
        pointsBoosted: points,
      }),
    });
    const newComment = await res.json();
    setComments((c) => [...c, newComment]);
    setMessage("");
    setPoints(0);
    setRecipientId("");
  }

  return (
    <div className="mt-3 pl-3 border-l border-gray-200">
      <h4 className="text-sm font-semibold mb-2">Comments</h4>
      <ul className="space-y-2">
        {comments.map((c) => (
          <li key={c.id} className="text-sm">
            <b>{c.sender.firstName || c.sender.email}</b>: {c.message}{" "}
            {c.pointsBoosted > 0 && (
              <span className="text-green-600">(+{c.pointsBoosted} pts)</span>
            )}
          </li>
        ))}
      </ul>
      <div className="mt-2 flex gap-2">
        <input
          type="text"
          placeholder="Add a comment..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="border p-1 rounded flex-1"
        />
        <input
          type="number"
          min="5"
          step={5}
          value={points}
          onChange={(e) => setPoints(parseInt(e.target.value))}
          className="w-20 border p-1 rounded"
          placeholder="pts"
        />
        <select
          value={recipientId}
          onChange={(e) => setRecipientId(e.target.value)}
          className="border p-1 rounded"
        >
          <option value="">Recipient</option>
          {users.map((u: any) => (
            <option key={u.id} value={u.id}>
              {u.label}
            </option>
          ))}
        </select>
        <button
          onClick={submitComment}
          className="bg-blue-600 text-white px-3 py-1 rounded"
        >
          Post
        </button>
      </div>
    </div>
  );
}
