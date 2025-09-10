"use client";

export default function AdminActionButton({
  id,
  action,
  label,
  secondary = false,
}: {
  id: string;
  action: "approve" | "reject" | "win" | "skip";
  label: string;
  secondary?: boolean;
}) {
  async function onClick() {
    const res = await fetch(`/api/nominations/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    if (res.ok) location.reload();
    else alert((await res.json()).error || "Failed");
  }

  return (
    <button
      onClick={onClick}
      className={`${secondary ? "bg-gray-200 text-black" : "bg-black text-white"} px-3 py-1 rounded`}
    >
      {label}
    </button>
  );
}
