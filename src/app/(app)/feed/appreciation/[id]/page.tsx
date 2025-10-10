import { prisma } from "@/lib/prisma";
import Image from "next/image";
import { notFound } from "next/navigation";
import CommentList from "@/components/CommentList";
import { User } from "@/types/user";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

function name(u: User) {
  const full = [u.firstName, u.lastName].filter(Boolean).join(" ");
  return full || u.email;
}

export default async function AppreciationPage({
  params,
}: {
  params: { id: string };
}) {
  const recognition = await prisma.recognition.findUnique({
    where: { id: params.id },
    include: {
      sender: true,
      recipients: { include: { recipient: true } },
    },
  });

  if (!recognition) return notFound();

  // you can also fetch all users for comments if needed
  const users = await prisma.user.findMany({
    where: { role: "EMPLOYEE", isActive: true },
  });

  return (
    <main className="max-w-3xl mx-auto p-6">
      <Link href={`/feed`}>
        <button className="text-gray-700 text-xs flex flex-row w-full items-center gap-2 mb-4">
          <ArrowLeft size={12} />
          Back to Feed
        </button>
      </Link>{" "}
      <ul className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        {/* Header: recipient(s) + points */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            {recognition.recipients.map((rr, i) => (
              <div key={rr.id} className="flex items-center gap-2">
                <Image
                  src={
                    rr.recipient.profileImage ?? "/default-profile-image.svg"
                  }
                  alt="Profile"
                  width={64}
                  height={64}
                  className="rounded-full w-12 h-12 border-2 border-blue-500"
                />
                <b className="text-gray-900 text-lg">{name(rr.recipient)}</b>
                {i < recognition.recipients.length - 1 && <span>,</span>}
              </div>
            ))}
          </div>

          <span className="text-sm px-3 py-1 bg-green text-white rounded-lg font-semibold">
            +{recognition.recipients.reduce((a, b) => a + b.points, 0)} pts
          </span>
        </div>

        {/* Sender info */}
        <div className="text-sm text-gray-600 flex flex-wrap items-center gap-2 mt-4">
          recognized by
          <Image
            src={
              recognition.sender.profileImage ?? "/default-profile-image.svg"
            }
            alt="Profile"
            width={32}
            height={32}
            className="rounded-full w-8 h-8 border-2 border-blue-500"
          />
          <b>{name(recognition.sender)}</b>
        </div>

        {/* Message */}
        <p className="mt-4 text-gray-800 text-base leading-relaxed">
          {recognition.message}
          {recognition.gifUrl && (
            <Image
              width={200}
              height={200}
              src={recognition.gifUrl}
              alt="shoutout gif"
              className="mt-4 rounded-lg max-h-60 w-auto mx-auto"
            />
          )}
        </p>

        {/* Date */}
        <small className="text-gray-500 block mt-4">
          {new Date(recognition.createdAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </small>
      </ul>
      <div className="mt-8">
        <CommentList
          recognitionId={recognition.id}
          users={users}
          defaultRecipientId={recognition.recipients[0]?.recipient?.id}
        />
      </div>
    </main>
  );
}
