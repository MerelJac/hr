import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import RecognitionList from "@/components/RecognitionList";

export default async function AppreciationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const recognition = await prisma.recognition.findUnique({
    where: { id: id },
    include: {
      sender: true,
      recipients: { include: { recipient: true } },
    },
  });

  if (!recognition) return notFound();

  // ✅ Fetch all users (for comments)

  const users = await prisma.user.findMany({
    where: {
      id: { not: process.env.SYSTEM_ADMIN_ID },
      isActive: true,
    },
  });

  return (
    <main className="max-w-3xl mx-auto p-6">
      <Link
        href="/feed"
        className="flex items-center gap-2 mb-4 text-gray-700 text-xs"
      >
        <ArrowLeft size={12} />
        Back to Feed
      </Link>

      {/* ✅ Reuse RecognitionList here with just one recognition */}
      <RecognitionList recs={[recognition]} users={users} />
    </main>
  );
}
