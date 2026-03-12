"use client";

import { useEffect, useState } from "react";
import { Gift, SquareArrowOutUpRight, X, Plus, Pencil } from "lucide-react";

type ToolboxLink = {
  id?: string;
  label: string;
  url: string;
};

function inputClass() {
  return "w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 placeholder:text-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent transition";
}

export default function RewardToolbox() {
  const [open, setOpen] = useState(false);
  const [links, setLinks] = useState<ToolboxLink[]>([]);
  const [editing, setEditing] = useState<ToolboxLink | null>(null);
  const [label, setLabel] = useState("");
  const [url, setUrl] = useState("");

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
      body: JSON.stringify(editing ? { id: editing.id, label, url } : { label, url }),
    });
    if (res.ok) {
      const saved = await res.json();
      setLinks((prev) =>
        editing ? prev.map((l) => (l.id === saved.id ? saved : l)) : [saved, ...prev]
      );
      setEditing(null);
      setLabel("");
      setUrl("");
    }
  }

  function cancelEdit() {
    setEditing(null);
    setLabel("");
    setUrl("");
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-indigo-500 hover:text-indigo-700 border border-indigo-200 hover:border-indigo-400 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-all"
      >
        <Gift size={13} />
        Reward Toolbox
      </button>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col max-h-[85vh] overflow-hidden">

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-indigo-400">Admin</p>
                <h2 className="text-base font-semibold text-gray-800 leading-tight">Reward Toolbox</h2>
              </div>
              <button
                onClick={() => { setOpen(false); cancelEdit(); }}
                className="p-1.5 rounded-lg text-gray-300 hover:text-gray-500 hover:bg-gray-100 transition-all"
              >
                <X size={16} />
              </button>
            </div>

            {/* Body */}
            <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">

              {/* Links list */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">Quick Links</p>
                {links.length > 0 ? (
                  <ul className="space-y-1.5">
                    {links.map((link) => (
                      <li
                        key={link.id}
                        className="flex items-center justify-between bg-gray-50 border border-gray-100 hover:border-indigo-100 hover:bg-indigo-50/40 rounded-xl px-3 py-2.5 transition-all group"
                      >
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 flex-1 min-w-0 text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors"
                        >
                          <span className="truncate">{link.label}</span>
                          <SquareArrowOutUpRight size={12} className="shrink-0 text-gray-300 group-hover:text-indigo-400" />
                        </a>
                        <button
                          onClick={() => { setEditing(link); setLabel(link.label); setUrl(link.url); }}
                          className="ml-2 p-1.5 rounded-lg text-gray-300 hover:text-indigo-500 hover:bg-indigo-100 transition-all shrink-0"
                          title="Edit"
                        >
                          <Pencil size={12} />
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="flex flex-col items-center gap-2 py-8 text-center">
                    <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
                      <Gift size={16} className="text-gray-300" />
                    </div>
                    <p className="text-sm text-gray-400">No links added yet.</p>
                  </div>
                )}
              </div>

              {/* Add / Edit form */}
              <div className="border-t border-gray-100 pt-4">
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">
                  {editing ? "Edit Link" : "Add Link"}
                </p>
                <form onSubmit={saveLink} className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-400 uppercase tracking-wide mb-1.5">Label</label>
                    <input
                      type="text"
                      value={label}
                      onChange={(e) => setLabel(e.target.value)}
                      className={inputClass()}
                      placeholder="e.g. Amazon Gift Cards"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 uppercase tracking-wide mb-1.5">URL</label>
                    <input
                      type="url"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      className={inputClass()}
                      placeholder="https://example.com"
                      required
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-1">
                    {editing && (
                      <button
                        type="button"
                        onClick={cancelEdit}
                        className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 border border-gray-200 hover:border-gray-300 rounded-xl transition-all"
                      >
                        Cancel
                      </button>
                    )}
                    <button
                      type="submit"
                      className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white rounded-xl transition-all"
                    >
                      <Plus size={14} />
                      {editing ? "Save Changes" : "Add Link"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}