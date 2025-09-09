export type IssueParams = {
  type: "AMAZON" | "VISA";
  valueCents: number;
  email?: string;
};

export type IssueResult = {
  externalId: string;
  code?: string;
  claimUrl?: string;
};

export interface RewardProvider {
  issueGiftCard(params: IssueParams): Promise<IssueResult>;
}

class MockProvider implements RewardProvider {
  async issueGiftCard(params: IssueParams): Promise<IssueResult> {
    // Simulate issuing instantly
    const suffix = Math.random().toString(36).slice(2, 8).toUpperCase();
    return {
      externalId: `mock_${Date.now()}`,
      code: `${params.type}-EGIFT-${suffix}`,
      claimUrl: undefined,
    };
  }
}

export function getRewardProvider(): RewardProvider {
  const name = process.env.REWARD_PROVIDER || "mock";
  // later: if (name === "tremendous") return new TremendousProvider(...);
  return new MockProvider();
}
