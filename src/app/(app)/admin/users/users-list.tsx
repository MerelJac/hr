"use client";
import UserInsightsModal from "@/components/UserInsightsModal";
import { Department } from "@/types/department";
import { User } from "@/types/user";
import { Pencil, Sparkles, X } from "lucide-react";
import Image from "next/image";
import { useState, useEffect } from "react";

function inputClass() {
  return "w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 placeholder:text-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent transition";
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1.5">
      {children}
    </label>
  );
}

export default function UsersList({ users }: { users: User[] }) {
  const [open, setOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      fetch("/api/departments")
        .then((res) => res.json())
        .then((data) => setDepartments(data))
        .catch((err) => console.error("Failed to load departments:", err));
    }
  }, [open]);

  function openEditModal(user: User) { setSelectedUser(user); setOpen(true); }
  function closeModal() { setSelectedUser(null); setOpen(false); }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedUser) return;
    const payload = {
      firstName: selectedUser.firstName,
      lastName: selectedUser.lastName,
      preferredName: selectedUser.preferredName,
      birthday: selectedUser.birthday,
      workAnniversary: selectedUser.workAnniversary,
      role: selectedUser.role,
      departmentId: (selectedUser as User).departmentId || null,
      email: selectedUser.email,
      pointsBalance: selectedUser.pointsBalance,
      monthlyBudget: selectedUser.monthlyBudget,
    };
    const res = await fetch(`/api/users/${selectedUser.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) { closeModal(); location.reload(); }
    else alert((await res.json()).error || "Failed to update user");
  }

  function patchUser(id: string, body: object) {
    return fetch(`/api/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).then((res) => res.ok && location.reload());
  }

  return (
    <section className="space-y-4 p-6">
      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        {users.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-12 text-center">
            <p className="text-sm text-gray-400">No users found.</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {users.map((u) => (
              <li key={u.id} className={`flex flex-wrap items-center gap-3 px-5 py-3.5 transition-colors ${u.isActive ? "hover:bg-gray-50" : "bg-gray-50/60"}`}>
                {/* Avatar */}
                <Image
                  src={u.profileImage ?? "/default-profile-image.svg"}
                  alt="Profile"
                  width={36}
                  height={36}
                  className={`rounded-full w-9 h-9 object-cover shrink-0 border ${u.isActive ? "border-indigo-200" : "border-gray-200 grayscale opacity-60"}`}
                />

                {/* Name / email */}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${u.isActive ? "text-gray-800" : "text-gray-400 line-through"}`}>
                    {u.firstName && u.lastName ? `${u.firstName} ${u.lastName}` : u.email}
                  </p>
                  {(u.firstName || u.lastName) && (
                    <p className="text-xs text-gray-400 truncate">{u.email}</p>
                  )}
                </div>

                {/* Role selector */}
                <select
                  className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs text-gray-600 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300 transition disabled:opacity-40 disabled:cursor-not-allowed"
                  value={u.role}
                  onChange={(e) => patchUser(u.id, { role: e.target.value })}
                  disabled={!u.isActive}
                >
                  <option>EMPLOYEE</option>
                  <option>MANAGER</option>
                  <option>ADMIN</option>
                  <option>SUPER_ADMIN</option>
                </select>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => openEditModal(u)}
                    disabled={!u.isActive}
                    className="p-1.5 rounded-lg text-gray-300 hover:text-indigo-500 hover:bg-indigo-50 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Edit user"
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    onClick={() => setSelectedUserId(u.id)}
                    className="p-1.5 rounded-lg text-gray-300 hover:text-indigo-500 hover:bg-indigo-50 transition-all"
                    title="View insights"
                  >
                    <Sparkles size={13} />
                  </button>

                  {u.isActive ? (
                    <button
                      onClick={() => patchUser(u.id, { isActive: false })}
                      className="px-2.5 py-1 text-xs font-medium text-red-400 hover:text-red-600 border border-red-100 hover:border-red-300 hover:bg-red-50 rounded-lg transition-all"
                      title="Remove access"
                    >
                      Remove Access
                    </button>
                  ) : (
                    <div className="flex gap-1">
                      <button
                        onClick={() => patchUser(u.id, { isActive: true })}
                        className="px-2.5 py-1 text-xs font-medium text-green-600 border border-green-100 hover:border-green-300 hover:bg-green-50 rounded-lg transition-all"
                      >
                        Reactivate
                      </button>
                      <button
                        onClick={() => fetch(`/api/users/${u.id}`, { method: "DELETE" }).then((res) => res.ok && location.reload())}
                        className="px-2.5 py-1 text-xs font-medium text-red-500 hover:text-red-700 border border-red-100 hover:border-red-300 hover:bg-red-50 rounded-lg transition-all"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {selectedUserId && (
        <UserInsightsModal userId={selectedUserId} onClose={() => setSelectedUserId(null)} />
      )}

      {/* Edit modal */}
      {open && selectedUser && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col max-h-[90vh] overflow-hidden">

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-indigo-400">Users</p>
                <h2 className="text-base font-semibold text-gray-800 leading-tight">Edit User</h2>
              </div>
              <button onClick={closeModal} className="p-1.5 rounded-lg text-gray-300 hover:text-gray-500 hover:bg-gray-100 transition-all">
                <X size={16} />
              </button>
            </div>

            {/* Body */}
            <div className="overflow-y-auto flex-1 px-6 py-5">
              <form id="edit-user-form" onSubmit={onSubmit} className="space-y-4">
                <div>
                  <FieldLabel>Email</FieldLabel>
                  <input type="email" className={inputClass()} value={selectedUser.email}
                    onChange={(e) => setSelectedUser({ ...selectedUser, email: e.target.value })} />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <FieldLabel>First Name</FieldLabel>
                    <input className={inputClass()} placeholder="First name" value={selectedUser.firstName || ""}
                      onChange={(e) => setSelectedUser({ ...selectedUser, firstName: e.target.value })} />
                  </div>
                  <div>
                    <FieldLabel>Last Name</FieldLabel>
                    <input className={inputClass()} placeholder="Last name" value={selectedUser.lastName || ""}
                      onChange={(e) => setSelectedUser({ ...selectedUser, lastName: e.target.value })} />
                  </div>
                </div>

                <div>
                  <FieldLabel>Preferred Name</FieldLabel>
                  <input className={inputClass()} placeholder="Preferred name" value={selectedUser.preferredName || ""}
                    onChange={(e) => setSelectedUser({ ...selectedUser, preferredName: e.target.value })} />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <FieldLabel>Birthday</FieldLabel>
                    <input type="date" className={inputClass()}
                      value={selectedUser.birthday ? new Date(selectedUser.birthday).toISOString().split("T")[0] : ""}
                      onChange={(e) => setSelectedUser({ ...selectedUser, birthday: e.target.value })} />
                  </div>
                  <div>
                    <FieldLabel>Work Anniversary</FieldLabel>
                    <input type="date" className={inputClass()}
                      value={selectedUser.workAnniversary ? new Date(selectedUser.workAnniversary).toISOString().split("T")[0] : ""}
                      onChange={(e) => setSelectedUser({ ...selectedUser, workAnniversary: e.target.value })} />
                  </div>
                </div>

                <div>
                  <FieldLabel>Department</FieldLabel>
                  <select className={inputClass()} value={(selectedUser as User).departmentId || ""}
                    onChange={(e) => setSelectedUser({ ...selectedUser, departmentId: e.target.value || null } as User)}>
                    <option value="">Unassigned</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>{dept.name}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <FieldLabel>Points Balance</FieldLabel>
                    <input type="number" className={inputClass()} value={selectedUser.pointsBalance ?? 0}
                      onChange={(e) => setSelectedUser({ ...selectedUser, pointsBalance: parseInt(e.target.value, 10) })} />
                  </div>
                  <div>
                    <FieldLabel>Points to Give</FieldLabel>
                    <input type="number" className={inputClass()} value={selectedUser.monthlyBudget ?? 0}
                      onChange={(e) => setSelectedUser({ ...selectedUser, monthlyBudget: parseInt(e.target.value, 10) })} />
                  </div>
                </div>

                <div>
                  <FieldLabel>Permission Level</FieldLabel>
                  <select className={inputClass()} value={selectedUser.role}
                    onChange={(e) => setSelectedUser({ ...selectedUser, role: e.target.value })}>
                    <option>EMPLOYEE</option>
                    <option>MANAGER</option>
                    <option>ADMIN</option>
                    <option>SUPER_ADMIN</option>
                  </select>
                </div>
              </form>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-2 px-6 py-4 border-t border-gray-100 shrink-0">
              <button type="button" onClick={closeModal}
                className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 border border-gray-200 hover:border-gray-300 rounded-xl transition-all">
                Cancel
              </button>
              <button type="submit" form="edit-user-form"
                className="px-4 py-2 text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white rounded-xl transition-all">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}