// src/components/AvailablePointsCard.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getAvailablePoints } from "@/lib/recognition";
import { MoveRight } from "lucide-react";
import Link from "next/link";
import { User } from "@/types/user";

export default async function AvailablePointsCard() {
  const session = await getServerSession(authOptions);
  const me = session?.user as User;
  if (!me?.id) return null;

  const available = await getAvailablePoints(me.id);

  return (
    <div className="border-2 border-blue rounded-lg p-4 shadow-sm bg-white flex items-center justify-between">
      <div>
        <h2 className="text-2xl font-bold">{available}</h2>
        <p className="text-lg">Stars to Give</p>
      </div>

       <Link
          href="/recognize"
          className="flex items-center gap-2 hover:text-blue-600"
        >
          <MoveRight size={18} />
        </Link>
    </div>
  );
}
