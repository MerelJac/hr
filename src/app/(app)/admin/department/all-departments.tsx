"use client";
import DepartmentsManager from "@/components/DepartmentManager";
import { useState } from "react";
import { DepartmentWithUsers } from "@/types/department";
import Image from "next/image";
import UserInsightsModal from "@/components/UserInsightsModal";
import { ChartBar, Plus, Sparkles, Users } from "lucide-react";

export function AllDepartments({ departments }: { departments: DepartmentWithUsers[] }) {
  const [departmentOpen, setDepartmentOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  return (
    <div className="space-y-5 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
            <ChartBar size={16} className="text-indigo-400" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">Admin</p>
            <h1 className="text-lg font-semibold text-gray-800 leading-tight">Departments</h1>
          </div>
        </div>
        <button
          onClick={() => setDepartmentOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white rounded-xl transition-all shadow-sm"
        >
          <Plus size={14} />
          Add Department
        </button>
      </div>

      <DepartmentsManager open={departmentOpen} onClose={() => setDepartmentOpen(false)} />

      {/* Department cards */}
      {departments.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-14 text-center rounded-2xl border border-gray-100 bg-white">
          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
            <Users size={18} className="text-gray-300" />
          </div>
          <p className="text-sm text-gray-400">No departments yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {departments.map((dept) => (
            <div key={dept.id} className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
              {/* Dept header */}
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
                    <Users size={12} className="text-indigo-400" />
                  </div>
                  <h3 className="text-sm font-semibold text-gray-800">{dept.name}</h3>
                  <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                    {dept.users.length}
                  </span>
                </div>
              </div>

              {/* Members */}
              {dept.users.length === 0 ? (
                <p className="text-xs text-gray-400 px-5 py-4 italic">No users in this department.</p>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {dept.users.map((u) => (
                    <li key={u.id} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors">
                      <Image
                        src={u.profileImage ?? "/default-profile-image.svg"}
                        alt="Profile"
                        width={36}
                        height={36}
                        className="rounded-full w-9 h-9 border border-indigo-200 object-cover shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800">
                          {u.firstName} {u.lastName}
                        </p>
                        <p className="text-xs text-gray-400 truncate">{u.email}</p>
                      </div>
                      <span className="text-xs font-medium px-2 py-0.5 rounded-lg bg-gray-100 border border-gray-200 text-gray-500 shrink-0">
                        {u.role}
                      </span>
                      <button
                        onClick={() => setSelectedUserId(u.id)}
                        className="p-1.5 rounded-lg text-gray-300 hover:text-indigo-500 hover:bg-indigo-50 transition-all shrink-0"
                        title="View insights"
                      >
                        <Sparkles size={13} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {selectedUserId && (
        <UserInsightsModal userId={selectedUserId} onClose={() => setSelectedUserId(null)} />
      )}
    </div>
  );
}