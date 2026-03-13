import { User } from "./user";

export type SimpleRecognition = {
  id: string;
  senderId: string;
  gifUrl: string | null;
  message: string;
  createdAt: Date;
};

// Reusable slim user shape — matches what Prisma selects in recognition queries
export type RecognitionUser = Pick<
  User,
  "id" | "firstName" | "lastName" | "email" | "profileImage"
>;

export type Recipient = {
  id: string;
  points: number;
  recipient: RecognitionUser & { departmentId?: string | null };
};

export type Recognition = {
  id: string;
  message: string;
  gifUrl?: string | null;
  createdAt: string | Date;
  coreValue?: CoreValue | null;
  sender: RecognitionUser;
  recipients: Recipient[];
};

export type Props = {
  recs: Recognition[];
  users: User[];
};

export type CoreValue = "LIGHT" | "RIGHT" | "SERVICE" | "PROBLEM" | "EVOLUTION";