"use client";

import Image from "next/image";
import { useState } from "react";
import RecognitionList from "@/components/RecognitionList";
import { User } from "@/types/user";
import { Recognition } from "@/types/recognition";
import UserInsightsModal from "@/components/UserInsightsModal";
import { Spotlight } from "lucide-react";
type ManagerDepartmentsClientProps = {
  manager: {
    department?: {
      name: string;
      users: {
        id: string;
        email: string;
        firstName: string | null;
        lastName: string | null;
        role: string;
        profileImage: string | null;
      }[];
    } | null;
  } | null;
  recs: Recognition[];
  users: User[];
  me: User;
};

export default function ManagerDepartmentsClient({
  manager,
  recs,
  users,
  me
}: ManagerDepartmentsClientProps) {

  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<"feed" | "team">("feed");

  if (!manager?.department) {
    return <p>You are not assigned to a department.</p>;
  }

  return (
    <section className="space-y-6">
      {/* Tabs */}
      <div className="flex border-b mb-4">
        <button
          onClick={() => setActiveTab("feed")}
          className={`px-4 py-2 font-medium ${
            activeTab === "feed"
              ? "border-b-2 border-blue-500 text-blue-600"
              : "text-gray-600"
          }`}
        >
          Feed
        </button>
        <button
          onClick={() => setActiveTab("team")}
          className={`px-4 py-2 font-medium ${
            activeTab === "team"
              ? "border-b-2 border-blue-500 text-blue-600"
              : "text-gray-600"
          }`}
        >
          Team
        </button>
      </div>
      {/* Feed tab */}
      {activeTab === "feed" && <RecognitionList recs={recs} users={users} user={me}  />}

      {/* Team tab */}
      {activeTab === "team" && (
        <div className="rounded-lg p-4 ">
          {manager.department.users.length === 0 ? (
            <p className="text-sm text-gray-500">
              No employees in your department.
            </p>
          ) : (
            <ul className="space-y-1 mb-6">
              {manager.department.users.map((u) => (
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
                  <small>{u.role}</small>
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
      )}
    </section>
  );
}
