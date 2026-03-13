"use client";
import DepartmentsManager from "@/components/DepartmentManager";
import { Department } from "@/types/department";
import { useEffect, useState } from "react";
import { Building2, Plus, UserPlus, X } from "lucide-react";

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
      body: JSON.stringify({ email, role, firstName, lastName, preferredName, birthday, workAnniversary, sendEmail, departmentId }),
    });
    if (res.ok) { setOpen(false); location.reload(); }
    else alert((await res.json()).error || "Failed to invite");
  }

  return (
    <>
      {/* Trigger buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white rounded-xl transition-all shadow-sm"
        >
          <UserPlus size={14} /> Add User
        </button>
        <button
          onClick={() => setDepartmentOpen(true)}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-500 hover:text-indigo-600 border border-gray-200 hover:border-indigo-200 hover:bg-indigo-50 rounded-xl transition-all"
        >
          <Building2 size={13} /> Department
        </button>
      </div>

      {/* Invite modal */}
      {open && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col max-h-[90vh] overflow-hidden">

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-indigo-400">Users</p>
                <h2 className="text-base font-semibold text-gray-800 leading-tight">Invite User</h2>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg text-gray-300 hover:text-gray-500 hover:bg-gray-100 transition-all"
              >
                <X size={16} />
              </button>
            </div>

            {/* Body */}
            <div className="overflow-y-auto flex-1 px-6 py-5">
              <form id="invite-form" onSubmit={onSubmit} className="space-y-4">
                <div>
                  <FieldLabel>Email</FieldLabel>
                  <input
                    type="email"
                    className={inputClass()}
                    placeholder="email@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <FieldLabel>First Name</FieldLabel>
                    <input className={inputClass()} placeholder="First name" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                  </div>
                  <div>
                    <FieldLabel>Last Name</FieldLabel>
                    <input className={inputClass()} placeholder="Last name" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                  </div>
                </div>

                <div>
                  <FieldLabel>Preferred Name</FieldLabel>
                  <input className={inputClass()} placeholder="Preferred name (optional)" value={preferredName} onChange={(e) => setPreferredName(e.target.value)} />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <FieldLabel>Birthday</FieldLabel>
                    <input type="date" className={inputClass()} value={birthday} onChange={(e) => setBirthday(e.target.value)} />
                  </div>
                  <div>
                    <FieldLabel>Work Anniversary</FieldLabel>
                    <input type="date" className={inputClass()} value={workAnniversary} onChange={(e) => setWorkAnniversary(e.target.value)} />
                  </div>
                </div>

                <div>
                  <FieldLabel>Permission Level</FieldLabel>
                  <select className={inputClass()} value={role} onChange={(e) => setRole(e.target.value)}>
                    <option>EMPLOYEE</option>
                    <option>MANAGER</option>
                    <option>ADMIN</option>
                    <option>SUPER_ADMIN</option>
                  </select>
                </div>

                <div>
                  <FieldLabel>Department</FieldLabel>
                  <select className={inputClass()} value={departmentId} onChange={(e) => setDepartmentId(e.target.value)} required>
                    <option value="">Select a department…</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>{dept.name}</option>
                    ))}
                  </select>
                </div>

                {/* Send email toggle */}
                <label className="flex items-center gap-3 cursor-pointer">
                  <div className="relative">
                    <input type="checkbox" checked={sendEmail} onChange={(e) => setSendEmail(e.target.checked)} className="sr-only peer" />
                    <div className="w-10 h-5 rounded-full border border-gray-200 bg-gray-100 peer-checked:bg-indigo-500 peer-checked:border-indigo-500 transition-all" />
                    <div className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-all peer-checked:translate-x-5" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">Send email invite</span>
                </label>
              </form>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-2 px-6 py-4 border-t border-gray-100 shrink-0">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 border border-gray-200 hover:border-gray-300 rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="invite-form"
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white rounded-xl transition-all"
              >
                <Plus size={14} /> Add User
              </button>
            </div>
          </div>
        </div>
      )}

      <DepartmentsManager open={departmentOpen} onClose={() => setDepartmentOpen(false)} />
    </>
  );
}