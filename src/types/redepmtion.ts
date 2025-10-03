export type RedemptionStatus = "PENDING" | "APPROVED" | "FULFILLED" | "FAILED" | "CANCELLED";
export type RedemptionType = "AMAZON" | "VISA" | "OTHER";

export interface Redemption {
  id: string;
  valueCents: number;
  catalogId: string |null;
  pointsSpent: number;
  status: RedemptionStatus;
  code?: string | null;
  claimUrl?: string | null;
  createdAt: string | Date;
  user: {
    id: string;
    email: string;
  };
}