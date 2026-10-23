"use client";

import {
  RankHubLeaderboard,
  RankHubLeaderboardProps,
} from "./rankhub-leaderboard";

export type CardChaseLeaderboardProps = RankHubLeaderboardProps;

export function CardChaseLeaderboard(props: CardChaseLeaderboardProps) {
  return <RankHubLeaderboard {...props} />;
}
