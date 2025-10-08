"use client";
import { Comment } from "@/types/comment";
import { User } from "@/types/user";
import { useState, useEffect } from "react";

type CommentListProps = {
  recognitionId: string;
  users: User[];
  defaultRecipientId?: string;
};
export default function CommentList({
  recognitionId,
  users,
  defaultRecipientId,
}: CommentListProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [message, setMessage] = useState("");
  const [points, setPoints] = useState(0);
  const [error, setError] = useState("");
  const [recipientId, setRecipientId] = useState(defaultRecipientId || "");
  const [showCommentBox, setShowCommentBox] = useState(false);

  useEffect(() => {
    fetch(`/api/comments?recognitionId=${recognitionId}`)
      .then((res) => res.json())
      .then(setComments);
  }, [recognitionId]);

  async function submitComment() {
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recognitionId,
          recipientId,
          message,
          pointsBoosted: points,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        // server returned an error
        setError(`Failed to post comment. ${data.error || "Unknown error"}`);
        console.log("Submit comment failed:", data);
        return;
      }

      // success → add the comment to state
      setComments((c) => [...c, data]);
      setMessage("");
      setPoints(0);
      setRecipientId(defaultRecipientId || "");
      setShowCommentBox(false);
    } catch (err) {
      console.log("Unexpected error submitting comment:", err);
      alert("Something went wrong. Please try again.");
    }
  }

  return (
    <div className="bg-white rounded-b-lg p-4">
      <ul className="space-y-2">
        {comments.map((c) => (
          <li key={c.id} className="text-sm">
            <b>
              {c.sender.firstName || c.sender.email} {c.sender.lastName}
            </b>
            : {c.message}{" "}
            {(c.pointsBoosted > 0  && c.recipient)&& (
              <span className="text-green-600">(+{c.pointsBoosted} pts to {c.recipient.firstName} {c.recipient.lastName})</span>
            )}
          </li>
        ))}
      </ul>
      {showCommentBox ? (
        <div className="mt-2 flex gap-2">
          <input
            type="text"
            placeholder="Add a comment!"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="border-2 border-blue p-1 rounded-lg flex-1"
          />

          <div className="flex flex-col">
            <input
              type="number"
              min="5"
              step={5}
              value={points}
              onChange={(e) => setPoints(parseInt(e.target.value))}
              className="w-20 border-2 border-blue p-1 rounded-lg"
              placeholder="pts"
            />
            <label className="flex text-end text-xs gap-1">+ points</label>
          </div>

          {points > 0 && (
            <div className="flex flex-col">
              <select
                value={recipientId}
                onChange={(e) => setRecipientId(e.target.value)}
                className="border-2 border-blue p-1 rounded-lg"
              >
                {!defaultRecipientId && <option value="">Who</option>}

                {users.map((u: User) => (
                  <option key={u.id} value={u.id}>
                    {u.preferredName ??
                      `${u.firstName ?? ""} ${u.lastName ?? ""}`}
                  </option>
                ))}
              </select>
              <label className="flex text-end text-xs gap-1">shoutout</label>
            </div>
          )}

          <button
            onClick={submitComment}
            className="bg-blue text-white px-3 py-1 rounded-lg"
          >
            Comment
          </button>
        </div>
      ) : (
        <div className="mt-2">
          <button
            onClick={() => setShowCommentBox(true)}
            className="bg-gray-200 px-3 py-1 rounded-lg"
          >
            + Comment
          </button>
        </div>
      )}
      {error && <small className="text-red-500">{error}</small>}
    </div>
  );
}
