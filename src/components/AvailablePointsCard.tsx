// src/components/AvailablePointsCard.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getAvailablePoints } from "@/lib/recognition";
import { User } from "@/types/user";
import AvailablePointsClient from "./AvailablePointsClient";
import { getAvailableRedeemPoints } from "@/lib/rewards";

export default async function AvailablePointsCard() {
  const session = await getServerSession(authOptions);
  const me = session?.user as User;
  if (!me?.id) return null;

  const available = await getAvailablePoints(me.id);
  const toRedeemAvailable = await getAvailableRedeemPoints(me.id);
  return (
    <AvailablePointsClient available={available} toRedeemAvailable={toRedeemAvailable}/>
  );
}
