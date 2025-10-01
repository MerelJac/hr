export type Nomination = {
  id: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "WON" | "SKIPPED";
  reason?: string | null;
  postUrl?: string | null;
  createdAt: string | Date;
  submitter?: {
    firstName?: string | null;
    lastName?: string | null;
    email?: string | null;
  } | null;
  nominee?: {
    firstName?: string | null;
    lastName?: string | null;
    email?: string | null;
  } | null;
};