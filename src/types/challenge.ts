import { Nomination } from "./nomination";
import { ChallengeRequirements } from "./challengeRequirements";
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