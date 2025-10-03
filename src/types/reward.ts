import type { RewardCategory } from "@prisma/client";

export type Reward = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  valueCents: number | null;
  categoryId: string;
  label: string;
  pointsCost: number;
  imageUrl: string | null;
  category?: RewardCategory;
};
