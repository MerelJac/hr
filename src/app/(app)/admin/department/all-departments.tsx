"use client";

import DepartmentsManager from "@/components/DepartmentManager";
import { useState } from "react";
import { DepartmentWithUsers } from "@/types/department";
import Image from "next/image";
import UserInsightsModal from "@/components/UserInsightsModal";
import { Spotlight } from "lucide-react";
export function AllDepartments({
  departments,
}: {
  departments: DepartmentWithUsers[];
}) {
  const [departmentOpen, setDepartmentOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  return (
    <div className="space-y-6 ">
      <div className="flex justify-end">
        <button
          onClick={() => setDepartmentOpen(true)}
          className="bg-black text-white px-3 py-2 rounded-xl transition hover:shadow-md"
        >
          + Department
        </button>
      </div>
      <DepartmentsManager
        open={departmentOpen}
        onClose={() => setDepartmentOpen(false)}
      />
      {departments.map((dept) => (
        <div key={dept.id} className="border rounded-lg p-4 shadow-sm">
          <h3 className="text-lg font-semibold mb-2">{dept.name}</h3>
          {dept.users.length === 0 ? (
            <p className="text-sm text-gray-500">
              No users in this department.
            </p>
          ) : (
            <ul className="space-y-1">
              {dept.users.map((u) => (
                <li key={u.id} className="flex items-center gap-2">
                  <Image
                    src={u.profileImage ?? "/default-profile-image.svg"}
                    alt="Profile"
                    width={64}
                    height={64}
                    className="rounded-full w-12 h-12 border-2 border-blue-500"
                  />
                  <span>
                    {u.firstName} {u.lastName}
                  </span>
                  <span className="text-gray-500 text-sm">({u.email})</span>
                  <span className="ml-auto text-xs px-2 py-0.5 rounded bg-gray-100">
                    {u.role}
                  </span>
                  <button
                    onClick={() => setSelectedUserId(u.id)}
                    className="text-blue-600 text-sm underline"
                  >
                    <Spotlight size={16} />
                  </button>
                </li>
              ))}
            </ul>
          )}
          {selectedUserId && (
            <UserInsightsModal
              userId={selectedUserId}
              onClose={() => setSelectedUserId(null)}
            />
          )}
        </div>
      ))}
    </div>
  );
}
