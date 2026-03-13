"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { User } from "@/types/user";
import LogoutButton from "@/app/login/logoutButton";
import SupportButton from "@/components/SupportButton";
import { formatDateLocal } from "@/lib/formatDate";
import {
  Camera,
  CheckCircle2,
  ChevronDown,
  Lock,
  Bell,
  Pencil,
  Rocket,
} from "lucide-react";

function inputClass() {
  return "w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 placeholder:text-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent transition";
}

function AccordionSection({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-5 py-4 text-left"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
            <Icon size={14} className="text-indigo-400" />
          </div>
          <span className="text-sm font-semibold text-gray-700">{title}</span>
        </div>
        <ChevronDown
          size={15}
          className={`text-gray-300 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      <div
        className={`grid transition-all duration-300 ease-in-out ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
      >
        <div className="overflow-hidden">
          <div className="px-5 pb-5 pt-1 border-t border-gray-100 space-y-4">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === "APPROVED")
    return (
      <span className="text-xs font-medium px-2 py-0.5 rounded-lg bg-green-50 border border-green-100 text-green-600">
        Approved
      </span>
    );
  if (status === "REJECTED")
    return (
      <span className="text-xs font-medium px-2 py-0.5 rounded-lg bg-red-50 border border-red-100 text-red-500">
        Rejected
      </span>
    );
  return (
    <span className="text-xs font-medium px-2 py-0.5 rounded-lg bg-gray-100 border border-gray-200 text-gray-500">
      {status}
    </span>
  );
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [birthday, setBirthday] = useState("");
  const [preferredName, setPreferredName] = useState("");
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState<"settings" | "challenges">(
    "settings",
  );
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");

  useEffect(() => {
    fetch("/api/me")
      .then((res) => res.json())
      .then((data) => {
        if (!data || data.error) return;
        setUser(data);
        if (data.birthday)
          setBirthday(new Date(data.birthday).toISOString().split("T")[0]);
        if (data.preferredName) setPreferredName(data.preferredName);
        if (data.profileImage) setProfileImage(data.profileImage);
        if (data.emailNotifications)
          setEmailNotifications(data.emailNotifications);
      });
  }, []);

  async function updateEmailNotifications(enabled: boolean) {
    try {
      const res = await fetch("/api/profile/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailNotifications: enabled }),
      });
      if (!res.ok) throw new Error("Failed to update notifications");
      setMessage(`Email notification set to ${emailNotifications}!`);
    } catch (err) {
      console.error(err);
      setMessage("Error saving notification setting.");
    }
  }

  async function uploadProfileImage(file: File) {
    try {
      const res = await fetch(
        `/api/profile/upload-url?contentType=${encodeURIComponent(file.type)}`,
      );
      if (!res.ok) {
        const errData = await res.json();
        setMessage(
          `Upload failed: ${errData.error || errData.details || res.statusText}`,
        );
        return;
      }
      const { uploadUrl, publicUrl } = await res.json();
      const uploadRes = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!uploadRes.ok) {
        setMessage("Image upload failed.");
        return;
      }
      const saveRes = await fetch("/api/profile/images", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: publicUrl }),
      });
      if (!saveRes.ok) setMessage("Failed to save image URL");
      setProfileImage(publicUrl);
      setMessage("Profile image updated!");
    } catch (err) {
      console.error(err);
      setMessage(`Upload failed. Please try again. ${err}`);
    }
  }

  async function saveProfile() {
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ birthday, preferredName }),
    });
    setMessage(res.ok ? "Profile updated!" : "Failed to update profile.");
  }

  async function changePassword() {
    setPasswordMessage("");
    if (newPassword !== confirmPassword) {
      setPasswordMessage("New passwords do not match.");
      return;
    }
    const res = await fetch("/api/profile/password", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ oldPassword, newPassword }),
    });
    const data = await res.json();
    if (res.ok) {
      setPasswordMessage("Password updated successfully!");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } else {
      setPasswordMessage(data.error || "Failed to update password.");
    }
  }

  if (!user)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gray-100 animate-pulse" />
          <p className="text-sm text-gray-400">Loading profile…</p>
        </div>
      </div>
    );

  return (
    <main className="max-w-2xl mx-auto p-6 space-y-5">
      {/* Profile hero card */}
      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm p-5">
        <div className="flex items-center gap-5">
          <div className="relative shrink-0">
            <Image
              src={profileImage ?? "/default-profile-image.svg"}
              alt="Profile"
              width={72}
              height={72}
              className="rounded-full border-2 border-indigo-200 object-cover w-[72px] h-[72px]"
            />
            <label className="absolute -bottom-1 -right-1 w-7 h-7 bg-indigo-600 hover:bg-indigo-700 rounded-full flex items-center justify-center cursor-pointer shadow transition-all">
              <Camera size={12} className="text-white" />
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files?.[0])
                    uploadProfileImage(e.target.files[0]);
                }}
              />
            </label>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-0.5">
              Profile
            </p>
            <h1 className="text-lg font-bold text-gray-800 truncate">
              {user.preferredName || `${user.firstName} ${user.lastName}`}
            </h1>
            <p className="text-sm text-gray-400 truncate">{user.email}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-100">
        {(["settings", "challenges"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-all capitalize
              ${
                activeTab === tab
                  ? "bg-indigo-50 text-indigo-600 border border-b-0 border-indigo-100"
                  : "text-gray-400 hover:text-gray-600"
              }`}
          >
            {tab === "settings" ? "Settings" : "Past Challenges"}
          </button>
        ))}
      </div>

      {/* Message banner */}
      {message && (
        <div className="flex items-center gap-2 rounded-xl bg-green-50 border border-green-100 text-green-700 text-sm px-4 py-3">
          <CheckCircle2 size={15} className="shrink-0" />
          {message}
        </div>
      )}

      {activeTab === "settings" && (
        <div className="space-y-3">
          {/* Basic info */}
          <div className="rounded-2xl border border-gray-100 bg-white shadow-sm p-5 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
              Basic Info
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-6">
              {[
                ["Name", `${user.firstName} ${user.lastName}`],
                ["Email", user.email],
                [
                  "Work Anniversary",
                  user.workAnniversary
                    ? formatDateLocal(user.workAnniversary)
                    : "Not set",
                ],
                [
                  "Birthday",
                  user.birthday ? formatDateLocal(user.birthday) : "Not set",
                ],
                user.role ? ["Role", user.role] : null,
                user.department?.name
                  ? ["Department", user.department.name]
                  : null,
              ]
                .filter((item): item is [string, string] => item !== null)
                .map(([label, value]) => (
                  <div key={label as string}>
                    <p className="text-xs text-gray-400 mb-0.5">{label}</p>
                    <p className="text-sm font-medium text-gray-700">
                      {value as string}
                    </p>
                  </div>
                ))}
            </div>
          </div>

          {/* Editable fields */}
          <AccordionSection icon={Pencil} title="Preferred Name">
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-400 uppercase tracking-wide mb-1.5">
                  Preferred Name
                </label>
                <input
                  type="text"
                  value={preferredName}
                  onChange={(e) => setPreferredName(e.target.value)}
                  className={inputClass()}
                  placeholder={user.firstName ?? "Preferred name"}
                />
              </div>
              <button
                onClick={saveProfile}
                className="px-4 py-2 text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white rounded-xl transition-all"
              >
                Save Changes
              </button>
            </div>
          </AccordionSection>

          {/* Change password */}
          <AccordionSection icon={Lock} title="Change Password">
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-400 uppercase tracking-wide mb-1.5">
                    Current Password
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className={inputClass()}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 uppercase tracking-wide mb-1.5">
                    New Password
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className={inputClass()}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-gray-400 uppercase tracking-wide mb-1.5">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={inputClass()}
                  />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={changePassword}
                  className="px-4 py-2 text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white rounded-xl transition-all"
                >
                  Update Password
                </button>
                {passwordMessage && (
                  <p
                    className={`text-xs ${passwordMessage.includes("successfully") ? "text-green-600" : "text-red-500"}`}
                  >
                    {passwordMessage}
                  </p>
                )}
              </div>
            </div>
          </AccordionSection>

          {/* Notifications */}
          <AccordionSection icon={Bell} title="Notifications">
            <label className="flex items-start gap-3 cursor-pointer">
              <div className="relative mt-0.5">
                <input
                  type="checkbox"
                  checked={emailNotifications}
                  onChange={(e) => {
                    const v = e.target.checked;
                    setEmailNotifications(v);
                    updateEmailNotifications(v);
                  }}
                  className="sr-only peer"
                />
                <div className="w-10 h-5 rounded-full border border-gray-200 bg-gray-100 peer-checked:bg-indigo-500 peer-checked:border-indigo-500 transition-all" />
                <div className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-all peer-checked:translate-x-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">
                  Email Notifications
                </p>
                <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">
                  Receive emails for shoutouts and comments. Essential system
                  notifications are always sent.
                </p>
              </div>
            </label>
          </AccordionSection>

          {/* Mobile logout/support */}
          <div className="flex gap-3 justify-center pt-2 md:hidden">
            <LogoutButton />
            <SupportButton />
          </div>
        </div>
      )}

      {activeTab === "challenges" && (
        <div className="space-y-3">
          {user.submittedNominations && user.submittedNominations.length > 0 ? (
            <ul className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden divide-y divide-gray-100">
              {user.submittedNominations.map((n) => (
                <li
                  key={n.id}
                  className="flex items-start justify-between gap-4 px-5 py-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0 mt-0.5">
                      <Rocket size={13} className="text-indigo-400" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">
                        {n.challenge.title}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {n.challenge.points} pts · Submitted{" "}
                        {formatDateLocal(n.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="shrink-0 pt-0.5">
                    {n.challenge.hideStatusFromSubmitter ? (
                      <span className="text-xs font-medium px-2 py-0.5 rounded-lg bg-gray-100 border border-gray-200 text-gray-500">
                        Submitted
                      </span>
                    ) : (
                      <StatusBadge status={n.status} />
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex flex-col items-center gap-2 py-14 text-center">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                <Rocket size={18} className="text-gray-300" />
              </div>
              <p className="text-sm text-gray-400">
                No challenge submissions yet.
              </p>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
