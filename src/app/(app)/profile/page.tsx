"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

type User = {
  firstName: string;
  lastName: string;
  email: string;
  workAnniversary: string;
  department?: string;
  profileImage?: string;
  birthday?: string;
  preferredName?: string;
};

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [birthday, setBirthday] = useState("");
  const [preferredName, setPreferredName] = useState("");
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/me")
      .then((res) => res.json())
      .then((data) => {
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
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/profile/image", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    if (res.ok) {
      setProfileImage(data.profileImage);
      setMessage("Profile image updated!");
    } else {
      setMessage("Failed to upload image.");
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

  if (!user) return <div className="p-6 text-gray-600">Loading...</div>;

  return (
    <main className="p-6 space-y-6 bg-white rounded-xl w-full">
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

      <div className="space-y-2">
        <p>
          <b>Email:</b> {user.email}
        </p>
        <p>
          <b>Work Anniversary:</b>{" "}
          {new Date(user.workAnniversary).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
        {user.department && (
          <p>
            <b>Department:</b> {user.department}
          </p>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Preferred Name</label>
          <input
            type="text"
            value={preferredName}
            onChange={(e) => setPreferredName(e.target.value)}
            className="border rounded-lg px-2 py-1 w-full"
            placeholder={user.firstName}
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Birthday</label>
          <input
            type="date"
            value={birthday}
            onChange={(e) => setBirthday(e.target.value)}
            className="border rounded-lg px-2 py-1 w-full"
          />
        </div>

        <button
          onClick={saveProfile}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Save Changes
        </button>
        {message && <p className="text-sm text-gray-600">{message}</p>}
      </div>
    </main>
  );
}
