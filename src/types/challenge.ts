import { Nomination } from "./nomination";

export type Challenge = {
  id: string;
  title: string;
  description?: string;
  qualification?: string;
  isActive: boolean;
  startDate: string;
  endDate: string;
  gifUrl?: string; 
  points: number;
  requirements?: {
    requiresNominee?: boolean;
    requiresReason?: boolean;
    requiresScreenshot?: boolean;
  };
  nominations?: Nomination
};