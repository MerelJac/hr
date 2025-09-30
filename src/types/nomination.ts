export type Nomination = {
  id: string;
  status: string;
  createdAt: string;
  challenge: { id: string; title: string; points: number };
};
