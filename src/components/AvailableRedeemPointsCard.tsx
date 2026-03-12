import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getAvailableRedeemPoints } from "@/lib/rewards";
import Link from "next/link";
import { ArrowRight, Star } from "lucide-react";
import { User } from "@/types/user";

export default async function AvailableRedeemPointsCard() {
  const session = await getServerSession(authOptions);
  const me = session?.user as User;
  if (!me?.id) return null;

  const available = await getAvailableRedeemPoints(me.id);

  return (
    <div className="rounded-2xl border border-gray-100 bg-white shadow-sm p-5 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-yellow-50 border border-yellow-100 flex items-center justify-center shrink-0">
          <Star size={18} className="text-yellow-400 fill-yellow-400" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">Available</p>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-gray-800 leading-tight">{available}</span>
            <span className="text-sm text-gray-400 font-medium">stars</span>
          </div>
        </div>
      </div>

      <Link
        href="/rewards"
        className="flex items-center gap-1.5 text-xs font-semibold text-indigo-500 hover:text-indigo-700 border border-indigo-200 hover:border-indigo-400 bg-indigo-50 hover:bg-indigo-100 rounded-xl px-3 py-2 transition-all shrink-0"
      >
        Redeem
        <ArrowRight size={13} />
      </Link>
    </div>
  );
}