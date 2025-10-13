import { User } from "./user";

export type SimpleRecognition = {
  id: string;
  senderId: string;
  gifUrl: string | null;
  message: string;
  createdAt: Date;
};

export type Recipient = {
  id: string;
  points: number;
  recipient: User;
};

export type Recognition = {
  id: string;
  message: string;
  gifUrl?: string | null;
  createdAt: string | Date;
  sender: User;
  recipients: Recipient[];
  
};

export type Props = {
  recs: Recognition[];
  users: User[];
};