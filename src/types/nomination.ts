import { ChallengeRequirements } from "./challenge";

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

export type NominationChallenge = {
  id: string;
  title: string;
  description?: string | null;
  qualification?: string | null;
  isActive: boolean;
  gifUrl?: string | null;
  startDate: string | Date;
  endDate: string | Date;
  points: number;
  createdAt: string | Date;
  updatedAt: string | Date;
  requirements?: ChallengeRequirements;
};
