"use client";
import { Comment } from "@/types/comment";
import { User } from "@/types/user";
import { EllipsisVerticalIcon, Send } from "lucide-react";
import { useState, useEffect } from "react";

type CommentListProps = {
  recognitionId: string;
  users: User[];
  defaultRecipientId?: string;
  user: User;
};

export default function CommentList({
  recognitionId,
  users,
  defaultRecipientId,
  user,
}: CommentListProps) {

  const [comments, setComments] = useState<Comment[]>([]);
  const [message, setMessage] = useState("");
  const [points, setPoints] = useState(0);
  const [error, setError] = useState("");
  const [recipientId, setRecipientId] = useState(defaultRecipientId || "");
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [dropdownId, setDropdownId] = useState<string | null>(null);
  const [deleteText, setDeleteText] = useState("Delete");

  const toggleDropdown = (id: string) => {
    setDropdownId((prev) => (prev === id ? null : id));
    console.log("comment sender:", comments);
  };

  async function deleteComment(id: string) {
    setDeleteText("Deleting...");
    const res = await fetch(`/api/comments/${encodeURIComponent(id)}?senderId=${user.id}`, {
      method: "DELETE",
    });
    if (res.ok) location.reload();
    else alert((await res.json()).error || "Failed to remove Comment");
  }

  useEffect(() => {
    fetch(`/api/comments?recognitionId=${recognitionId}`)
      .then((res) => res.json())
      .then(setComments);
  }, [recognitionId]);

  async function submitComment() {
    try {
      if (!message.trim()) {
        setError("Comment cannot be empty");
        return;
      }
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recognitionId, recipientId, message, pointsBoosted: points }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(`Failed to post comment. ${data.error || "Unknown error"}`);
        console.log("Submit comment failed:", data);
        return;
      }
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
    <div className="px-5 py-4 bg-gray-50 space-y-3">
      {/* Comments */}
      {comments.length > 0 && (
        <ul className="space-y-2">
          {comments.map((c) => (
            <li key={c.id} className="flex items-start justify-between gap-2 group">
              <p className="text-xs text-gray-600 leading-relaxed flex-1">
                <span className="font-semibold text-gray-800">
                  {c.sender.firstName || c.sender.email} {c.sender.lastName}
                </span>
                {" "}
                {c.message}
                {c.pointsBoosted > 0 && c.recipient && (
                  <span className="ml-1.5 inline-flex items-center gap-0.5 text-yellow-600 font-medium">
                    ⭐ +{c.pointsBoosted} to {c.recipient.firstName} {c.recipient.lastName}
                  </span>
                )}
              </p>
              {(user.role === "SUPER_ADMIN" || user.id === c.sender.id) && (
                <div className="relative shrink-0">
                  <button
                    onClick={() => toggleDropdown(c.id)}
                    className="p-1 rounded-md text-gray-300 hover:text-gray-500 hover:bg-gray-200 transition-all opacity-0 group-hover:opacity-100"
                  >
                    <EllipsisVerticalIcon size={13} />
                  </button>
                  {dropdownId === c.id && (
                    <div className="absolute right-0 mt-1 bg-white border border-gray-100 shadow-lg rounded-xl py-1 z-10 min-w-[110px]">
                      <button
                        className="w-full text-left text-xs text-red-500 hover:bg-red-50 px-3 py-2 transition-colors"
                        onClick={() => deleteComment(c.id)}
                      >
                        {deleteText}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      {/* Comment composer */}
      {showCommentBox ? (
        <div className="space-y-2">
          <div className="flex gap-2 flex-wrap items-end">
            <input
              type="text"
              placeholder="Write a comment…"
              value={message}
              onChange={(e) => { setMessage(e.target.value); setError(""); }}
              onKeyDown={(e) => e.key === "Enter" && submitComment()}
              className="flex-1 min-w-0 border border-gray-200 bg-white rounded-xl px-3 py-2 text-sm text-gray-700 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent transition"
              autoFocus
            />

            <div className="flex flex-col gap-0.5">
              <input
                type="number"
                min="5"
                step={5}
                value={points || ""}
                onChange={(e) => setPoints(parseInt(e.target.value) || 0)}
                className="w-20 border border-gray-200 bg-white rounded-xl px-3 py-2 text-sm text-center text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent transition"
                placeholder="pts"
              />
              <span className="text-xs text-gray-400 text-center">+ stars</span>
            </div>

            {points > 0 && (
              <div className="flex flex-col gap-0.5">
                <select
                  value={recipientId}
                  onChange={(e) => setRecipientId(e.target.value)}
                  className="border border-gray-200 bg-white rounded-xl px-2.5 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent transition"
                >
                  {!defaultRecipientId && <option value="">Who?</option>}
                  {users.map((u: User) => (
                    <option key={u.id} value={u.id}>
                      {u.preferredName ?? `${u.firstName ?? ""} ${u.lastName ?? ""}`}
                    </option>
                  ))}
                </select>
                <span className="text-xs text-gray-400 text-center">shoutout</span>
              </div>
            )}

            <div className="flex gap-1.5">
              <button
                onClick={() => { setShowCommentBox(false); setError(""); setMessage(""); }}
                className="px-3 py-2 text-xs text-gray-400 hover:text-gray-600 border border-gray-200 hover:border-gray-300 rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                onClick={submitComment}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white rounded-xl transition-all"
              >
                <Send size={12} />
                Post
              </button>
            </div>
          </div>

          {error && (
            <p className="text-xs text-red-500 flex items-center gap-1">
              <span>⚠</span> {error}
            </p>
          )}
        </div>
      ) : (
        <button
          onClick={() => setShowCommentBox(true)}
          className="text-xs font-medium text-gray-400 hover:text-indigo-500 transition-colors"
        >
          + Add a comment
        </button>
      )}
    </div>
  );
}