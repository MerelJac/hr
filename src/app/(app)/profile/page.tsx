"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { User } from "@/types/user";
import LogoutButton from "@/app/login/logoutButton";
import SupportButton from "@/components/SupportButton";
import { formatDateLocal } from "@/lib/formatDate";

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [birthday, setBirthday] = useState("");
  const [preferredName, setPreferredName] = useState("");
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState<"settings" | "challenges">(
    "settings"
  );
  const [emailNotifications, setEmailNotifications] = useState(false);

  // Change password form state
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
        if (data.birthday) {
          setBirthday(new Date(data.birthday).toISOString().split("T")[0]);
        }
        if (data.preferredName) {
          setPreferredName(data.preferredName);
        }
        if (data.profileImage) {
          setProfileImage(data.profileImage);
        }

        if (data.emailNotifications) {
          setEmailNotifications(data.emailNotifications);
        }
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
      // 1️⃣ Ask the backend for a presigned URL
      const res = await fetch(
        `/api/profile/upload-url?contentType=${encodeURIComponent(file.type)}`
      );
      const { uploadUrl, publicUrl } = await res.json();

      // 2️⃣ Upload directly to S3 (PUT)
      const uploadRes = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!uploadRes.ok) throw new Error("S3 upload failed");

      // 3️⃣ Save the image URL in your app DB
      const saveRes = await fetch("/api/profile/images", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: publicUrl }),
      });

      if (!saveRes.ok) throw new Error("Failed to save image URL");

      setProfileImage(publicUrl);
      setMessage("Profile image uploaded successfully!");
    } catch (err) {
      console.error(err);
      setMessage("Upload failed. Please try again.");
    }
  }

  async function saveProfile() {
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ birthday, preferredName }),
    });

    if (res.ok) {
      setMessage("Profile updated!");
    } else {
      setMessage("Failed to update profile.");
    }
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

  if (!user) return <div className="p-6 text-gray-600">Loading...</div>;

  return (
    <main className="p-6 bg-white rounded-xl w-full h-screen">
      {/* Tabs */}
      <div className="flex border-b mb-6">
        <button
          onClick={() => setActiveTab("settings")}
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === "settings"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Settings
        </button>
        <button
          onClick={() => setActiveTab("challenges")}
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === "challenges"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Past Challenges
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "settings" && (
<div className="space-y-8">
  {/* Header */}
  <div className="flex items-center justify-between border-b pb-4">
    <div>
      <h1 className="text-3xl font-bold text-gray-800">
        Hi, {user.preferredName || `${user.firstName} ${user.lastName}`}
      </h1>
      <p className="text-gray-500 text-sm mt-1">
        Manage your profile, preferences, and account security
      </p>
    </div>

    {/* Profile image */}
    <div className="relative group">
      <Image
        src={profileImage ?? "/default-profile-image.svg"}
        alt="Profile"
        width={100}
        height={100}
        className="rounded-full border-4 border-blue-500 shadow-md group-hover:opacity-80 transition"
      />
      <label className="absolute bottom-1 right-1 bg-blue-600 text-white text-xs px-2 py-1 rounded-full cursor-pointer shadow hover:bg-blue-700 transition">
        ✎
        <input
          type="file"
          className="hidden"
          accept="image/*"
          onChange={(e) => {
            if (e.target.files?.[0]) {
              uploadProfileImage(e.target.files[0]);
            }
          }}
        />
      </label>
    </div>
  </div>

  {/* Message */}
  {message && (
    <div className="rounded-lg border border-yellow-300 bg-yellow-100 text-yellow-800 p-3 text-sm">
      {message}
    </div>
  )}

  {/* Basic Info */}
  <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 space-y-2">
    <h2 className="text-lg font-semibold text-gray-800 mb-3">Basic Info</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-6 text-gray-700">
      <p>
        <b>Name:</b> {user.firstName} {user.lastName}
      </p>
      <p>
        <b>Email:</b> {user.email}
      </p>
      <p>
        <b>Work Anniversary:</b>{" "}
        {user.workAnniversary ? formatDateLocal(user.workAnniversary) : "Not set"}
      </p>
      <p>
        <b>Birthday:</b>{" "}
        {user.birthday ? formatDateLocal(user.birthday) : "Not set"}
      </p>
      {user.role && (
        <p>
          <b>Role:</b> {user.role}
        </p>
      )}
      {user.department?.name && (
        <p>
          <b>Department:</b> {user.department.name}
        </p>
      )}
    </div>
  </div>

  {/* Editable Fields */}
  <details className="group border border-gray-200 bg-white rounded-2xl p-5 shadow-sm">
    <summary className="font-medium cursor-pointer text-lg flex items-center justify-between">
      Editable Fields
      <span className="text-gray-400 group-open:rotate-180 transition-transform">
        ▼
      </span>
    </summary>
    <div className="mt-4 space-y-4">
      <label className="block text-sm font-medium text-gray-700">
        Preferred Name
      </label>
      <input
        type="text"
        value={preferredName}
        onChange={(e) => setPreferredName(e.target.value)}
        className="border rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder={user.firstName ?? "Preferred Name"}
      />
      <button
        onClick={saveProfile}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
      >
        Update Name
      </button>
    </div>
  </details>

  {/* Change Password */}
  <details className="group border border-gray-200 bg-white rounded-2xl p-5 shadow-sm">
    <summary className="font-medium cursor-pointer text-lg flex items-center justify-between">
      Change Password
      <span className="text-gray-400 group-open:rotate-180 transition-transform">
        ▼
      </span>
    </summary>
    <div className="mt-4 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <input
          type="password"
          placeholder="Current Password"
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
          className="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="password"
          placeholder="New Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="password"
          placeholder="Confirm New Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 md:col-span-2"
        />
      </div>
      <button
        onClick={changePassword}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
      >
        Update Password
      </button>
      {passwordMessage && (
        <p className="text-sm text-gray-600">{passwordMessage}</p>
      )}
    </div>
  </details>

  {/* Notifications */}
  <details className="group border border-gray-200 bg-white rounded-2xl p-5 shadow-sm">
    <summary className="font-medium cursor-pointer text-lg flex items-center justify-between">
      Notifications
      <span className="text-gray-400 group-open:rotate-180 transition-transform">
        ▼
      </span>
    </summary>
    <div className="mt-4 space-y-4">
      <label className="flex items-start gap-3 text-gray-700">
        <input
          type="checkbox"
          checked={emailNotifications}
          onChange={(e) => {
            const enabled = e.target.checked;
            setEmailNotifications(enabled);
            updateEmailNotifications(enabled);
          }}
          className="mt-1 w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <span className="flex flex-col">
          <span className="font-medium">Email Notifications</span>
          <small className="text-gray-500">
            Receive emails for shoutouts and comments. Even if toggled off, you’ll still receive essential system notifications.
          </small>
        </span>
      </label>
    </div>
  </details>

  {/* Mobile logout/support */}
  <div className="flex flex-row gap-3 justify-center items-center md:hidden">
    <LogoutButton />
    <SupportButton />
  </div>
</div>

      )}

      {activeTab === "challenges" && (
        <div>
          <h2 className="text-xl font-semibold mb-4">
            Your Challenge Submissions
          </h2>
          {user.submittedNominations && user.submittedNominations.length > 0 ? (
            <ul className="divide-y border rounded-lg">
              {user.submittedNominations.map((n) => (
                <li key={n.id} className="p-4">
                  <p>
                    <b>Challenge:</b> {n.challenge.title} ({n.challenge.points}{" "}
                    pts)
                  </p>
                  <p>
                    <b>Status:</b>{" "}
                    {n.challenge.hideStatusFromSubmitter ? (
                      "SUBMITTED"
                    ) : (
                      <span
                        className={`font-medium ${
                          n.status === "APPROVED"
                            ? "text-green-600"
                            : n.status === "REJECTED"
                            ? "text-red-600"
                            : "text-gray-600"
                        }`}
                      >
                        {n.status}
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-gray-500">
                    Submitted {formatDateLocal(n.createdAt)}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No challenge submissions yet.</p>
          )}
        </div>
      )}
    </main>
  );
}
