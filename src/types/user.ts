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
  birthday?: string;
  workAnniversary?: string;
  role?: string;
  isActive?: boolean;
  submittedNominations?: Nomination[];
};
