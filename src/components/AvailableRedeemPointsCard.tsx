// src/components/AvailablePointsCard.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getAvailableRedeemPoints } from "@/lib/rewards";
import Link from "next/link";
import { MoveRight } from "lucide-react";

export default async function AvailableRedeemPointsCard() {
  const session = await getServerSession(authOptions);
  const me = session?.user as any;
  if (!me?.id) return null;

  const available = await getAvailableRedeemPoints(me.id);

  return (
    <div className="border rounded-lg p-4 shadow-sm bg-white flex items-center justify-between">
      <div>
        <h2 className="text-lg font-semibold">{available}</h2>
        <p className="text-2xl font-bold">Stars to redeem</p>
      </div>
       <Link
          href="/rewards"
          className="flex items-center gap-2 hover:text-blue-600"
        >
          <MoveRight size={18} />
        </Link>
    </div>
  );
}
