"use client";

import { Check, Pencil, Trash } from "lucide-react";
import { useEffect, useState } from "react";

type Department = {
  id: string;
  name: string;
};

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

  // ✅ Load departments when modal opens
  useEffect(() => {
    if (open) {
      fetchDepartments();
    }
  }, [open]);

  async function fetchDepartments() {
    setLoading(true);
    const res = await fetch("/api/departments");
    const data = await res.json();
    setLoading(false);
    setDepartments(data);
  }

  // ✅ Add new department
  async function addDepartment(e: React.FormEvent) {
    e.preventDefault();
    if (!newDepartment.trim()) return;
    const res = await fetch("/api/departments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newDepartment }),
    });
    if (res.ok) {
      setNewDepartment("");
      fetchDepartments();
    } else {
      alert("Failed to add department");
    }
  }

  // ✅ Start editing a department
  function startEdit(dept: Department) {
    setEditingId(dept.id);
    setEditingName(dept.name);
  }

  // ✅ Save updated name
  async function saveEdit(deptId: string) {
    const res = await fetch(`/api/departments/${deptId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editingName }),
    });
    if (res.ok) {
      setEditingId(null);
      setEditingName("");
      fetchDepartments();
    } else {
      alert("Failed to update department");
    }
  }

  // ✅ Delete department
  async function deleteDepartment(deptId: string) {
    if (!confirm("Are you sure you want to delete this department?")) return;
    const res = await fetch(`/api/departments/${deptId}`, { method: "DELETE" });
    if (res.ok) {
      fetchDepartments();
    } else {
      alert("Failed to delete department");
    }
  }

  return (
    <>
      {open && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 relative">
            <button
              onClick={onClose}
              className="absolute top-2 right-2 text-gray-500 hover:text-black"
            >
              ✕
            </button>

            <h2 className="text-xl font-semibold mb-4">Manage Departments</h2>

            {/* ✅ Add new department */}
            <form onSubmit={addDepartment} className="flex gap-2 mb-4">
              <input
                className="border rounded-xl px-3 py-2 flex-1"
                placeholder="New department name"
                value={newDepartment}
                onChange={(e) => setNewDepartment(e.target.value)}
              />
              <button
                type="submit"
                className="bg-black text-white px-4 py-2 rounded-xl"
              >
                Add
              </button>
            </form>

            {/* ✅ List departments */}
            <div className="flex flex-col gap-2 max-h-80 overflow-y-auto">
              {!loading && departments.length === 0 && (
                <p className="text-sm text-gray-500">No departments found.</p>
              )}

              {loading && <p className="text-sm text-gray-500">Loading...</p>}

              {departments.map((dept) => (
                <div
                  key={dept.id}
                  className="flex items-center justify-between border rounded-xl px-3 py-2"
                >
                  {editingId === dept.id ? (
                    <input
                      className="border rounded-xl px-2 py-1 flex-1 mr-2"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                    />
                  ) : (
                    <span className="flex-1">{dept.name}</span>
                  )}

                  <div className="flex gap-2">
                    {editingId === dept.id ? (
                      <button
                        onClick={() => saveEdit(dept.id)}
                        className="text-green-600 hover:underline"
                      >
                        <Check size={16} />
                      </button>
                    ) : (
                      <button
                        onClick={() => startEdit(dept)}
                        className="text-blue-600 hover:underline"
                      >
                        <Pencil size={16} />
                      </button>
                    )}
                    <button
                      onClick={() => deleteDepartment(dept.id)}
                      className="text-red-600 hover:underline"
                    >
                      <Trash size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
