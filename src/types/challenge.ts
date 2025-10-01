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
  nominations?: Nomination[];
};

export type ChallengeRequirements = {
  requiresNominee?: boolean;
  requiresReason?: boolean;
  requiresScreenshot?: boolean;
  requiresPostUrl?: boolean;
};