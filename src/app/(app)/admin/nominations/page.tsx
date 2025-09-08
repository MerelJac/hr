import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Image from "next/image";
import AdminActionButton from "@/components/AdminActionButton";

export default async function NominationsAdminPage() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;
  if (role !== "SUPER_ADMIN") return <div className="p-6">Forbidden</div>;

  const nominations = await prisma.nomination.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      submitter: { select: { email: true, firstName: true, lastName: true } },
      nominee: { select: { email: true, firstName: true, lastName: true } },
    },
    take: 100,
  });

  const name = (u: any) =>
    [u?.firstName, u?.lastName].filter(Boolean).join(" ") || u?.email;

  return (
    <main className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Nominations</h1>
      <ul className="space-y-3">
        {nominations.map((n) => (
          <li key={n.id} className="border rounded p-4 space-y-2">
            <div className="text-sm text-gray-600 flex items-center justify-between">
              <div>
                <b>Type:</b> {n.type} • <b>Status:</b> {n.status} • <b>By:</b>{" "}
                {name(n.submitter)} • {new Date(n.createdAt).toLocaleString()}
              </div>
              {n.type === "EOM" && n.nominee && (
                <div>
                  <b>Nominee:</b> {name(n.nominee)}
                </div>
              )}
            </div>
            {n.type === "LINKEDIN" && n.imageUrl && (
              <div className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={n.imageUrl}
                  alt="LinkedIn"
                  className="w-40 h-40 object-cover rounded"
                />
                {n.caption && <p className="text-sm">{n.caption}</p>}
              </div>
            )}
            {n.reason && (
              <p className="text-sm">
                <b>Reason:</b> {n.reason}
              </p>
            )}

            <div className="flex gap-2">
              {n.type === "LINKEDIN" && n.status === "PENDING" && (
                <>
                  <AdminActionButton
                    id={n.id}
                    action="approve"
                    label="Approve (+10 to submitter)"
                  />
                  <AdminActionButton
                    id={n.id}
                    action="reject"
                    label="Reject"
                    secondary
                  />
                </>
              )}
              {n.type === "EOM" && n.status !== "WON" && (
                <AdminActionButton
                  id={n.id}
                  action="win"
                  label="Mark Winner (+100 to nominee)"
                />
              )}
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}

function Action({
  id,
  action,
  label,
  secondary,
}: {
  id: string;
  action: "approve" | "reject" | "win";
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
      className={`${
        secondary ? "bg-gray-200 text-black" : "bg-black text-white"
      } px-3 py-1 rounded`}
    >
      {label}
    </button>
  );
}
