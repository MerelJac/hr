export type Nomination = {
  id: string;
  createdAt: string;
  challenge: { id: string; title: string; points: number };
  status: "PENDING" | "APPROVED" | "REJECTED" | "WON" | "SKIPPED";
  reason?: string | null;
  postUrl?: string | null;
  nominee?: {
    email?: string | null;
    firstName?: string | null;
    lastName?: string | null;
  } | null;
};
