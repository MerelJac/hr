"use client";

import { useEffect, useState } from "react";
import { Gift, SquareArrowOutUpRight, X, Plus } from "lucide-react";

type ToolboxLink = {
  id?: string;
  label: string;
  url: string;
};

export default function RewardToolbox() {
  const [open, setOpen] = useState(false);
  const [links, setLinks] = useState<ToolboxLink[]>([]);
  const [editing, setEditing] = useState<ToolboxLink | null>(null);
  const [label, setLabel] = useState("");
  const [url, setUrl] = useState("");

  // Fetch links from DB
  useEffect(() => {
    (async () => {
      const res = await fetch("/api/reward-toolbox");
      if (res.ok) setLinks(await res.json());
    })();
  }, []);

  async function saveLink(e: React.FormEvent) {
    e.preventDefault();
    const method = editing ? "PATCH" : "POST";
    const res = await fetch("/api/reward-toolbox", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(
        editing ? { id: editing.id, label, url } : { label, url }
      ),
    });

    if (res.ok) {
      const saved = await res.json();
      setLinks((prev) => {
        if (editing) {
          return prev.map((l) => (l.id === saved.id ? saved : l));
        } else {
          return [saved, ...prev];
        }
      });
      setEditing(null);
      setLabel("");
      setUrl("");
    }
  }

  return (
    <>
      {/* Open button */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
      >
        <Gift size={18} />
        Reward Toolbox
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 relative animate-fadeIn">
            <button
              onClick={() => setOpen(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
            >
              <X size={20} />
            </button>

            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Gift size={20} className="text-blue-600" />
              Reward Toolbox
            </h2>

            {/* Links list */}
            {links.length > 0 ? (
              <ul className="space-y-2 mb-4">
                {links.map((link) => (
                  <li
                    key={link.id}
                    className="flex items-center justify-between border rounded-lg px-3 py-2 hover:bg-blue-50"
                  >
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-between"
                    >
                      {link.label}
                      <SquareArrowOutUpRight size={16} />
                    </a>
                    <button
                      onClick={() => {
                        setEditing(link);
                        setLabel(link.label);
                        setUrl(link.url);
                      }}
                      className="text-blue-600 text-sm ml-2"
                    >
                      Edit
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 text-sm mb-4">
                No links available yet.
              </p>
            )}

            {/* Add/Edit form */}
            <form onSubmit={saveLink} className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Label
                </label>
                <input
                  type="text"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  className="border rounded-lg px-2 py-1 w-full"
                  placeholder="e.g. Amazon Gift Card"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  URL
                </label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="border rounded-lg px-2 py-1 w-full"
                  placeholder="https://example.com"
                  required
                />
              </div>

              <div className="flex justify-end gap-2">
                {editing && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(null);
                      setLabel("");
                      setUrl("");
                    }}
                    className="bg-gray-400 text-white px-4 py-2 rounded-lg hover:bg-gray-500"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <Plus size={16} />
                  {editing ? "Save Changes" : "Add Link"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
