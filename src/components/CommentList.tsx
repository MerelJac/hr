"use client";
import { useState, useEffect } from "react";

export default function CommentList({
  recognitionId,
  users,
  currentUserId,
  defaultRecipientId,
}: any) {
  const [comments, setComments] = useState<any[]>([]);
  const [message, setMessage] = useState("");
  const [points, setPoints] = useState(0);
  const [recipientId, setRecipientId] = useState(defaultRecipientId || "");


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
    <div className="ml-6 bg-white rounded-lg p-4 border-t-2 border-blue">
      <ul className="space-y-2">
        {comments.map((c) => (
          <li key={c.id} className="text-sm">
            <b>{c.sender.firstName || c.sender.email} {c.sender.lastName}</b>: {c.message}{" "}
            {c.pointsBoosted > 0 && (
              <span className="text-green-600">(+{c.pointsBoosted} pts)</span>
            )}
          </li>
        ))}
      </ul>
      <div className="mt-2 flex gap-2">
        <input
          type="text"
          placeholder="Add a comment!"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="border-2 border-blue p-1 rounded-lg flex-1"
        />

        <select
          value={recipientId}
          onChange={(e) => setRecipientId(e.target.value)}
          className="border-2 border-blue p-1 rounded-lg"
        >
          <option value="">Who</option>
          {users.map((u: any) => (
            <option key={u.id} value={u.id}>
              {u.label}
            </option>
          ))}
        </select>
        <input
          type="number"
          min="5"
          step={5}
          value={points}
          onChange={(e) => setPoints(parseInt(e.target.value))}
          className="w-20 border-2 border-blue p-1 rounded-lg"
          placeholder="pts"
        />
        <button
          onClick={submitComment}
          className="bg-blue text-white px-3 py-1 rounded-lg"
        >
          Comment
        </button>
      </div>
    </div>
  );
}
