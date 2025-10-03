import { prisma } from "@/lib/prisma";
import { getRewardProvider } from "@/lib/rewardProvider";

export async function listCatalog() {
  return prisma.rewardCatalog.findMany({
    where: { isActive: true },
    orderBy: [{ valueCents: "asc" }],
  });
}

/**
 * Atomically:
 *  - Verify user has enough points
 *  - Create Redemption
 *  - Decrement user.pointsBalance
 *  - Call provider
 *  - Update redemption with provider response
 */
export async function redeemItem(userId: string, catalogId: string, deliverEmail?: string, idemKey?: string) {
  const provider = getRewardProvider();

  return prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error("User not found");

    const item = await tx.rewardCatalog.findUnique({ where: { id: catalogId } });
    if (!item || !item.isActive) throw new Error("Reward item unavailable");

    if (user.pointsBalance < item.pointsCost) throw new Error("Insufficient points");

    // (Optional) handle idempotency
    if (idemKey) {
      const existing = await tx.redemption.findUnique({ where: { idemKey } });
      if (existing) return existing;
    }

    const redemption = await tx.redemption.create({
      data: {
        userId,
        catalogId: item.id,
        pointsSpent: item.pointsCost,
        valueCents: item.valueCents ?? 0, 
        deliverEmail: deliverEmail ?? user.email,
        provider: process.env.REWARD_PROVIDER || "mock",
        status: "PENDING",
        idemKey,
      },
    });

    // decrement balance
    await tx.user.update({
      where: { id: userId },
      data: { pointsBalance: { decrement: item.pointsCost } },
    });

    // Call provider (outside DB, but we're still in logical flow)
    const issued = await provider.issueGiftCard({
      valueCents: item.valueCents ?? 0,
      email: deliverEmail ?? user.email ?? undefined,
    });

    const fulfilled = await tx.redemption.update({
      where: { id: redemption.id },
      data: {
        status: "FULFILLED",
        externalId: issued.externalId,
        code: issued.code,
        claimUrl: issued.claimUrl,
      },
    });

    return fulfilled;
  });
}

export async function listMyRedemptions(userId: string) {
  return prisma.redemption.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: { catalog: true, user: true },
  });
}

// see how many points the user has that are redeemable
export async function getAvailableRedeemPoints(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { pointsBalance: true } });
  return user?.pointsBalance || 0;
}
