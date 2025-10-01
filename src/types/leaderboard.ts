export type LeaderboardUser = {
  id: string;
  profileImage?: string | null;
  preferredName?: string | null;
  firstName?: string | null;
};

export type LeaderboardRow = {
  user: LeaderboardUser | null;
  points?: number; // used in "Most Points" leaderboards
  count?: number;  // used in "Shoutouts" leaderboards
};

export type LeaderboardData = {
  received: LeaderboardRow[];
  given: LeaderboardRow[];
  shoutoutsGiven: LeaderboardRow[];
  shoutoutsReceived: LeaderboardRow[];
};