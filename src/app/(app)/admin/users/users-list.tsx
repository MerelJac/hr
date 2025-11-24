"use client";

import UserInsightsModal from "@/components/UserInsightsModal";
import { Department } from "@/types/department";
import { User } from "@/types/user";
import { PencilIcon, Spotlight } from "lucide-react";
import Image from "next/image";
import { useState, useEffect } from "react";

export default function UsersList({ users }: { users: User[] }) {
  const [open, setOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  // ✅ Fetch departments when edit modal opens
  useEffect(() => {
    if (open) {
      fetch("/api/departments")
        .then((res) => res.json())
        .then((data) => setDepartments(data))
        .catch((err) => console.error("Failed to load departments:", err));
    }
  }, [open]);

  function openEditModal(user: User) {
    setSelectedUser(user);
    setOpen(true);
  }

  function closeModal() {
    setSelectedUser(null);
    setOpen(false);
  }

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
      departmentId: (selectedUser as User).departmentId || null, // 👈 make sure we're sending departmentId
      pointsBalance: selectedUser.pointsBalance,
    };

    const res = await fetch(`/api/users/${selectedUser.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      closeModal();
      location.reload();
    } else {
      alert((await res.json()).error || "Failed to update user");
    }
  }

  return (
    <section className="space-y-4 p-4">
      <h2 className="font-semibold mb-2">Users</h2>
      <ul className="space-y-1">
        {users.map((u) => (
          <li key={u.id} className="flex items-center gap-2">
            <Image
              src={u.profileImage ?? "/default-profile-image.svg"}
              alt="Profile"
              width={28}
              height={28}
              className="rounded-full w-10 h-10 border-2 border-blue-500"
            />
            <span
              className={`w-xl ${
                u.isActive ? "" : "line-through text-gray-500"
              }`}
            >
              {u.email}
            </span>

            <select
              className="border-2 rounded-xl px-2 py-1"
              value={u.role}
              onChange={(e) =>
                fetch(`/api/users/${u.id}`, {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ role: e.target.value }),
                }).then((res) => res.ok && location.reload())
              }
              disabled={!u.isActive}
              title={!u.isActive ? "User is deactivated" : undefined}
            >
              <option>EMPLOYEE</option>
              <option>MANAGER</option>
              <option>ADMIN</option>
              <option>SUPER_ADMIN</option>
            </select>

            <button
              onClick={() => openEditModal(u)}
              className="ml-2 text-blue-600"
              disabled={!u.isActive}
            >
              <PencilIcon size={16} />
            </button>

            <button
              onClick={() => setSelectedUserId(u.id)}
              className="text-blue-600 text-sm underline"
            >
              <Spotlight size={16} />
            </button>
            {u.isActive ? (
              <button
                onClick={() =>
                  fetch(`/api/users/${u.id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ isActive: false }),
                  }).then((res) => res.ok && location.reload())
                }
                className="ml-2 text-red-600"
                title="Deactivate (remove access)"
              >
                Remove Access
              </button>
            ) : (
              <>
                <button
                  onClick={() =>
                    fetch(`/api/users/${u.id}`, {
                      method: "PATCH",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ isActive: true }),
                    }).then((res) => res.ok && location.reload())
                  }
                  className="ml-2 text-green-700"
                  title="Reactivate"
                >
                  Reactivate
                </button>
                <button
                  onClick={() =>
                    fetch(`/api/users/${u.id}`, { method: "DELETE" }).then(
                      (res) => res.ok && location.reload()
                    )
                  }
                  className="ml-2 text-red-700"
                  title="Delete Permanently"
                >
                  Delete Permanently
                </button>
              </>
            )}
          </li>
        ))}
      </ul>

      {selectedUserId && (
        <UserInsightsModal
          userId={selectedUserId}
          onClose={() => setSelectedUserId(null)}
        />
      )}

      {/* ✏️ Edit Modal */}
      {open && selectedUser && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 relative">
            <button
              onClick={closeModal}
              className="absolute top-2 right-2 text-gray-500 hover:text-black"
            >
              ✕
            </button>
            <h2 className="text-xl font-semibold mb-4">Edit User</h2>

            <form onSubmit={onSubmit} className="flex flex-col gap-3">
              <input
                className="border rounded-xl px-3 py-2"
                type="email"
                value={selectedUser.email}
                disabled
              />

              <div className="flex gap-2">
                <input
                  className="border rounded-xl px-3 py-2 flex-1"
                  placeholder="First name"
                  value={selectedUser.firstName || ""}
                  onChange={(e) =>
                    setSelectedUser({
                      ...selectedUser,
                      firstName: e.target.value,
                    })
                  }
                />
                <input
                  className="border rounded-xl px-3 py-2 flex-1"
                  placeholder="Last name"
                  value={selectedUser.lastName || ""}
                  onChange={(e) =>
                    setSelectedUser({
                      ...selectedUser,
                      lastName: e.target.value,
                    })
                  }
                />
              </div>

              <input
                className="border rounded-xl px-3 py-2"
                placeholder="Preferred name"
                value={selectedUser.preferredName || ""}
                onChange={(e) =>
                  setSelectedUser({
                    ...selectedUser,
                    preferredName: e.target.value,
                  })
                }
              />

              <label className="flex flex-col gap-1">
                <span className="text-sm text-gray-600">Birthday</span>
                <input
                  type="date"
                  className="border rounded-xl px-3 py-2"
                  value={
                    selectedUser.birthday
                      ? new Date(selectedUser.birthday)
                          .toISOString()
                          .split("T")[0]
                      : ""
                  }
                  onChange={(e) =>
                    setSelectedUser({
                      ...selectedUser,
                      birthday: e.target.value,
                    })
                  }
                />
              </label>

              <label className="flex flex-col gap-1">
                <span className="text-sm text-gray-600">Work Anniversary</span>
                <input
                  type="date"
                  className="border rounded-xl px-3 py-2"
                  value={
                    selectedUser.workAnniversary
                      ? new Date(selectedUser.workAnniversary)
                          .toISOString()
                          .split("T")[0]
                      : ""
                  }
                  onChange={(e) =>
                    setSelectedUser({
                      ...selectedUser,
                      workAnniversary: e.target.value,
                    })
                  }
                />
              </label>

              {/* ✅ Department dropdown */}
              <label className="flex flex-col gap-1">
                <span className="text-sm text-gray-600">Department</span>
                <select
                  className="border rounded-xl px-3 py-2"
                  value={(selectedUser as User).departmentId || ""}
                  onChange={(e) =>
                    setSelectedUser({
                      ...selectedUser,
                      departmentId: e.target.value || null,
                    } as User)
                  }
                >
                  <option value="">Unassigned</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-1">
                <span className="text-sm text-gray-600">Points Balance</span>
                <input
                  type="number"
                  className="border rounded-xl px-3 py-2"
                  value={selectedUser.pointsBalance ?? 0}
                  onChange={(e) =>
                    setSelectedUser({
                      ...selectedUser,
                      pointsBalance: parseInt(e.target.value, 10),
                    })
                  }
                />
              </label>

              <label className="flex flex-col gap-1">
                <span className="text-sm text-gray-600">Permission Status</span>
                <select
                  className="border rounded-xl px-3 py-2"
                  value={selectedUser.role}
                  onChange={(e) =>
                    setSelectedUser({ ...selectedUser, role: e.target.value })
                  }
                >
                  <option>EMPLOYEE</option>
                  <option>MANAGER</option>
                  <option>ADMIN</option>
                  <option>SUPER_ADMIN</option>
                </select>
              </label>

              <button
                type="submit"
                className="bg-black text-white px-4 py-2 rounded-xl"
              >
                Save Changes
              </button>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
