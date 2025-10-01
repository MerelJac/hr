// user.ts
import { Nomination } from "./nomination";

export type User = {
  id?: string;
  firstName?: string;
  lastName?: string;
  preferredName?: string;
  email?: string;
  profileImage?: string;
  department?: string;
  birthday?: string | Date;
  workAnniversary?: string | Date;
  role?: string;
  isActive: boolean;
  submittedNominations?: Nomination[];
};

export type LightUser = {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  preferredName?: string | null; // optional if you want
};
