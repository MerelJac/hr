import { NominationChallenge } from "@prisma/client";

export type Nomination = {
  id: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "WON" | "SKIPPED";
  reason?: string | null;
  postUrl?: string | null;
  createdAt: string | Date;
  challengeId: string;
  challenge: NominationChallenge;
  screenshot: string | null;
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