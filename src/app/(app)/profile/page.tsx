"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { User } from "@/types/user";
import LogoutButton from "@/app/login/logoutButton";
import SupportButton from "@/components/SupportButton";

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [birthday, setBirthday] = useState("");
  const [preferredName, setPreferredName] = useState("");
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState<"settings" | "challenges">(
    "settings"
  );

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
      });
  }, []);

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
        <div className="space-y-6">
          {/* Profile Info */}
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold">
              Hi, {user.preferredName || `${user.firstName} ${user.lastName}`}
            </h1>
            <div className="relative">
              <Image
                src={profileImage ?? "/default-profile-image.svg"}
                alt="Profile"
                width={80}
                height={80}
                className="rounded-full w-20 h-20 border-2 border-blue-500"
              />
              <label className="absolute bottom-0 right-0 bg-blue-600 text-white text-xs px-2 py-1 rounded cursor-pointer hover:bg-blue-700">
                Update
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

          {/* Basic Info */}
          <div className="space-y-2">
            <p>
              <b>Name:</b> {user.firstName} {user.lastName}
            </p>
            <p>
              <b>Email:</b> {user.email}
            </p>
            <p>
              <b>Work Anniversary:</b>{" "}
              {user.workAnniversary
                ? new Date(user.workAnniversary).toLocaleDateString()
                : "Not set"}
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

          {/* Editable Fields */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium">
                Preferred Name
              </label>
              <input
                type="text"
                value={preferredName}
                onChange={(e) => setPreferredName(e.target.value)}
                className="border rounded-lg px-2 py-1 w-full"
                placeholder={user.firstName ?? "Preferred Name"}
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Birthday</label>
              {birthday ? (
                <input
                  type="date"
                  value={birthday ?? ""}
                  onChange={(e) => setBirthday(e.target.value)}
                  className="border rounded-lg px-2 py-1 w-full bg-gray-100 text-gray-500 cursor-not-allowed"
                />
              ) : (
                <input
                  type="date"
                  className="border rounded-lg px-2 py-1 w-full"
                  value={birthday ?? ""}
                  onChange={(e) => setBirthday(e.target.value)}
                  placeholder="Not set"
                />
              )}
            </div>

            <button
              onClick={saveProfile}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Save Changes
            </button>
            {message && <p className="text-sm text-gray-600">{message}</p>}
          </div>

          {/* Change Password Section */}
          <details className="group space-y-4">
            <summary className="font-medium">
              Change Password
            </summary>
            <div className="mt-4 space-y-4">
              <input
                type="password"
                placeholder="Current Password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="border rounded-lg px-2 py-1 w-full"
              />
              <input
                type="password"
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="border rounded-lg px-2 py-1 w-full"
              />
              <input
                type="password"
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="border rounded-lg px-2 py-1 w-full"
              />
              <button
                onClick={changePassword}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Update Password
              </button>
              {passwordMessage && (
                <p className="text-sm text-gray-600">{passwordMessage}</p>
              )}
            </div>
          </details>

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
                    Submitted {new Date(n.createdAt).toLocaleDateString()}
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
