import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import NominationModal from "@/components/NominationModal";
import AvailablePointsCard from "@/components/AvailablePointsCard";
import AvailableRedeemPointsCard from "@/components/AvailableRedeemPointsCard";

export default async function FeedPage() {
  const session = await getServerSession(authOptions);
  if (!session) return <div className="p-6">Please sign in.</div>;
  const me = session.user as any;

  const recs = await prisma.recognition.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      sender: { select: { firstName: true, lastName: true, email: true } },
      recipients: {
        include: {
          recipient: {
            select: { firstName: true, lastName: true, email: true },
          },
        },
      },
    },
  });

  function name(u: any) {
    const full = [u.firstName, u.lastName].filter(Boolean).join(" ");
    return full || u.email;
  }

  const users = await prisma.user.findMany({
    select: { id: true, firstName: true, lastName: true, email: true },
  });

  const simpleUsers = users.map((u) => ({ id: u.id, label: name(u) }));

  return (
    <main className="p-6 space-y-4">
      <div className="flex flex-row justify-between">
        <h1 className="text-2xl font-semibold mb-2">Recognition Feed</h1>
        <NominationModal users={simpleUsers} />
      </div>
      <div className="flex flex-row justify-between">
        <ul className="space-y-3">
          {recs.map((r) => (
            <li key={r.id} className="border rounded-lg p-4">
              <div className="text-sm text-gray-600">
                <b>{name(r.sender)}</b> recognized{" "}
                {r.recipients.map((rr, i) => (
                  <span key={rr.id}>
                    <b>{name(rr.recipient)}</b> (+{rr.points})
                    {i < r.recipients.length - 1 ? ", " : ""}
                  </span>
                ))}{" "}
                • {new Date(r.createdAt).toLocaleString()}
              </div>
              <p className="mt-2">{r.message}</p>
            </li>
          ))}
        </ul>
        <div id="actionItems" className="flex flex-col gap-4">
          <AvailablePointsCard/>
          <AvailableRedeemPointsCard/>
        </div>
      </div>
    </main>
  );
}
