// user.ts
import { Department } from "./department";
import { Nomination } from "./nomination";

export type User = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  preferredName: string | null;
  email: string;
  profileImage: string | null;
  birthday: string | Date | null;
  workAnniversary: string | Date | null;
  role: string;
  departmentId?: string | null; 
  department?: Department | null;
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
