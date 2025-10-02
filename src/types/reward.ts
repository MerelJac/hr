import type { RewardCategory, RewardType } from "@prisma/client";

export type Reward = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  type: RewardType | null;
  valueCents: number | null;
  categoryId: string;
  label: string;
  pointsCost: number;
  imageUrl: string | null;
  category?: RewardCategory;
};
