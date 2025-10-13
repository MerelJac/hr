"use client";

import DepartmentsManager from "@/components/DepartmentManager";
import { Department } from "@/types/department";
import { useEffect, useState } from "react";

export default function InviteForm() {
  const [open, setOpen] = useState(false);
  const [departmentOpen, setDepartmentOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("EMPLOYEE");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [preferredName, setPreferredName] = useState("");
  const [birthday, setBirthday] = useState("");
  const [workAnniversary, setWorkAnniversary] = useState("");
  const [sendEmail, setSendEmail] = useState(true);
  const [departmentId, setDepartmentId] = useState("");
  const [departments, setDepartments] = useState<Department[]>([]);

  useEffect(() => {
    if (open) {
      fetch("/api/departments")
        .then((res) => res.json())
        .then((data) => setDepartments(data))
        .catch((err) => console.error("Failed to load departments:", err));
    }
  }, [open]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/invites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        role,
        firstName,
        lastName,
        preferredName,
        birthday,
        workAnniversary,
        sendEmail,
        departmentId,
      }),
    });
    if (res.ok) {
      setOpen(false);
      location.reload();
    } else {
      alert((await res.json()).error || "Failed to invite");
    }
  }

  return (
    <>
      {/* Button to open modal */}
      <div className="flex flex-row gap-2">
        {" "}
        <button
          onClick={() => setOpen(true)}
          className="bg-black text-white px-3 py-2 rounded-xl"
        >
          + User
        </button>
        <button
          onClick={() => setDepartmentOpen(true)}
          className="bg-black text-white px-3 py-2 rounded-xl"
        >
          + Department
        </button>
      </div>

      {/* Modal overlay */}
      {open && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 relative">
            {/* Close button */}
            <button
              onClick={() => setOpen(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-black"
            >
              ✕
            </button>

            <h2 className="text-xl font-semibold mb-4">Invite User</h2>

            <form onSubmit={onSubmit} className="flex flex-col gap-3">
              <input
                className="border rounded-xl px-3 py-2"
                placeholder="email@company.com"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <div className="flex gap-2">
                <input
                  className="border rounded-xl px-3 py-2 flex-1"
                  placeholder="First name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
                <input
                  className="border rounded-xl px-3 py-2 flex-1"
                  placeholder="Last name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>

              <input
                className="border rounded-xl px-3 py-2"
                placeholder="Preferred name"
                value={preferredName}
                onChange={(e) => setPreferredName(e.target.value)}
              />

              <label className="flex flex-col gap-1">
                <span className="text-sm text-gray-600">Birthday</span>
                <input
                  type="date"
                  className="border rounded-xl px-3 py-2"
                  value={birthday}
                  onChange={(e) => setBirthday(e.target.value)}
                />
              </label>

              <label className="flex flex-col gap-1">
                <span className="text-sm text-gray-600">Work Anniversary</span>
                <input
                  type="date"
                  className="border rounded-xl px-3 py-2"
                  value={workAnniversary}
                  onChange={(e) => setWorkAnniversary(e.target.value)}
                />
              </label>

              <label className="flex flex-col gap-1">
                <span className="text-sm text-gray-600">Permission Status</span>
                <select
                  className="border rounded-xl px-3 py-2"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  <option>EMPLOYEE</option>
                  <option>MANAGER</option>
                  <option>ADMIN</option>
                  <option>SUPER_ADMIN</option>
                </select>
              </label>

              <label className="flex flex-col gap-1">
                <span className="text-sm text-gray-600">Department</span>
                <select
                  className="border rounded-xl px-3 py-2"
                  value={departmentId}
                  onChange={(e) => setDepartmentId(e.target.value)}
                  required
                >
                  <option value="">Select a department</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={sendEmail}
                  onChange={(e) => setSendEmail(e.target.checked)}
                />
                Send email invite
              </label>

              <button
                type="submit"
                className="bg-black text-white px-4 py-2 rounded-xl"
              >
                Add User
              </button>
            </form>
          </div>
        </div>
      )}
      <DepartmentsManager
        open={departmentOpen}
        onClose={() => setDepartmentOpen(false)}
      />
    </>
  );
}
