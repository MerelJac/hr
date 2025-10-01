// src/types/comment.ts
import type { User } from "./user";

export type Comment = {
  id: string;
  recognitionId: string;
  sender: User;
  recipient?: User | null;
  message?: string;
  pointsBoosted: number;
  createdAt: string | Date;
};
