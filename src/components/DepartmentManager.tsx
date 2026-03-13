"use client";
import { Check, Pencil, Plus, Trash, X, Building2 } from "lucide-react";
import { useEffect, useState } from "react";

type Department = { id: string; name: string };

export default function DepartmentsManager({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [newDepartment, setNewDepartment] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) fetchDepartments();
  }, [open]);

  async function fetchDepartments() {
    setLoading(true);
    const res = await fetch("/api/departments");
    const data = await res.json();
    setDepartments(data);
    setLoading(false);
  }

  async function addDepartment(e: React.FormEvent) {
    e.preventDefault();
    if (!newDepartment.trim()) return;
    const res = await fetch("/api/departments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newDepartment }),
    });
    if (res.ok) { setNewDepartment(""); fetchDepartments(); }
    else alert("Failed to add department");
  }

  function startEdit(dept: Department) {
    setEditingId(dept.id);
    setEditingName(dept.name);
  }

  async function saveEdit(deptId: string) {
    const res = await fetch(`/api/departments/${deptId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editingName }),
    });
    if (res.ok) { setEditingId(null); setEditingName(""); fetchDepartments(); }
    else alert("Failed to update department");
  }

  async function deleteDepartment(deptId: string) {
    if (!confirm("Are you sure you want to delete this department?")) return;
    const res = await fetch(`/api/departments/${deptId}`, { method: "DELETE" });
    if (res.ok) fetchDepartments();
    else alert("Failed to delete department");
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col max-h-[85vh] overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-indigo-400">Admin</p>
            <h2 className="text-base font-semibold text-gray-800 leading-tight">Manage Departments</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-300 hover:text-gray-500 hover:bg-gray-100 transition-all"
          >
            <X size={16} />
          </button>
        </div>

        {/* Add form */}
        <div className="px-6 py-4 border-b border-gray-100 shrink-0">
          <form onSubmit={addDepartment} className="flex gap-2">
            <input
              className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 placeholder:text-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent transition"
              placeholder="New department name…"
              value={newDepartment}
              onChange={(e) => setNewDepartment(e.target.value)}
            />
            <button
              type="submit"
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white rounded-xl transition-all"
            >
              <Plus size={13} /> Add
            </button>
          </form>
        </div>

        {/* List */}
        <div className="overflow-y-auto flex-1 px-6 py-4">
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-11 rounded-xl bg-gray-100 animate-pulse" />
              ))}
            </div>
          ) : departments.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-10 text-center">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                <Building2 size={18} className="text-gray-300" />
              </div>
              <p className="text-sm text-gray-400">No departments yet.</p>
            </div>
          ) : (
            <ul className="space-y-2">
              {departments.map((dept) => (
                <li
                  key={dept.id}
                  className="flex items-center justify-between gap-2 border border-gray-100 bg-gray-50 rounded-xl px-3 py-2.5"
                >
                  {editingId === dept.id ? (
                    <input
                      className="flex-1 border border-indigo-200 rounded-lg px-2.5 py-1.5 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent transition"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      autoFocus
                    />
                  ) : (
                    <span className="text-sm font-medium text-gray-700 flex-1">{dept.name}</span>
                  )}

                  <div className="flex items-center gap-1 shrink-0">
                    {editingId === dept.id ? (
                      <button
                        onClick={() => saveEdit(dept.id)}
                        className="p-1.5 rounded-lg text-gray-300 hover:text-green-500 hover:bg-green-50 transition-all"
                        title="Save"
                      >
                        <Check size={14} />
                      </button>
                    ) : (
                      <button
                        onClick={() => startEdit(dept)}
                        className="p-1.5 rounded-lg text-gray-300 hover:text-indigo-500 hover:bg-indigo-50 transition-all"
                        title="Edit"
                      >
                        <Pencil size={14} />
                      </button>
                    )}
                    <button
                      onClick={() => deleteDepartment(dept.id)}
                      className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all"
                      title="Delete"
                    >
                      <Trash size={14} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 shrink-0 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 border border-gray-200 hover:border-gray-300 rounded-xl transition-all"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}