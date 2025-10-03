import { Nomination } from "./nomination";

export type Challenge = {
  id: string;
  title: string;
  description?: string | null;
  qualification?: string | null;
  isActive: boolean;
  startDate: string | Date;
  endDate: string | Date;
  points: number;
  gifUrl?: string | null;
  requirements?: ChallengeRequirements;
  nominations?: ChallengeNominationLite[];
};

export type ChallengeRequirements = {
  requiresNominee?: boolean;
  requiresReason?: boolean;
  requiresScreenshot?: boolean;
  requiresPostUrl?: boolean;
};

export type ChallengeNominationLite = {
  id: string;
  status: string; // or NominationStatus
};