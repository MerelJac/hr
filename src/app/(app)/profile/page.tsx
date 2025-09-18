"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [birthday, setBirthday] = useState("");
  const [message, setMesssage] = useState("");
  useEffect(() => {
    fetch("/api/me")
      .then((res) => res.json())
      .then((data) => {
        setUser(data);
        if (data.birthday) {
          setBirthday(new Date(data.birthday).toISOString().split("T")[0]);
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
    return data.profileImage;
  }

  async function saveBirthday() {
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ birthday }),
    });
    if (res.ok) {
      setMesssage("Birthday updated!");
    } else {
      setMesssage("Failed to update birthday.");
    }
  }

  if (!user) return <div className="p-6 text-white">Loading...</div>;

  return (
    <main className="p-6 space-y-4 bg-white rounded-xl p-4 min-w-full">
      <div className="flex flex-row justify-between align-center">
      <h1 className="text-2xl font-semibold">
        Hi, {user.firstName} {user.lastName}
      </h1>
      <Image
        src={user.profileImage ?? "/default-profile-image.svg"}
        alt="Profile"
        width={80}
        height={80}
        className="rounded-full w-16 h-16 border-2 border-blue"
      />
      </div>


      <p>
        <b>Email:</b> {user.email}
      </p>
      <p>
        <b>Work Anniversary: </b>
        {new Date(user.workAnniversary).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </p>

      <div className="space-y-2">
        <label className="block text-sm font-medium">Birthday</label>
        <input
          type="date"
          value={birthday}
          onChange={(e) => setBirthday(e.target.value)}
          className="border rounded-lg px-2 mr-2 py-1"
        />
        <button
          onClick={saveBirthday}
          className="bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700"
        >
          Save
        </button>
        {message && <p className="text-sm text-gray-600">{message}</p>}
      </div>
    </main>
  );
}
