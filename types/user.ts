export type UserProfile = {
  id: string;
  displayName?: string;
  mainTeamId?: string;
  hasCompletedOnboarding: boolean;
  createdAt: string;
  updatedAt: string;
};

export type FollowTargetType = "team" | "player" | "match";

export type FollowRecord = {
  id: string;
  targetType: FollowTargetType;
  targetId: string;
  targetName: string;
  createdAt: string;
};

export type FavoriteRecord = {
  id: string;
  articleId: string;
  articleTitle: string;
  articleCoverUrl?: string;
  articleType?: string;
  createdAt: string;
};

export type NotificationPermission = "default" | "granted" | "denied" | "unsupported";

export type NotificationSettings = {
  userId: string;
  browserPermission: NotificationPermission;
  followReminders: boolean;
  majorMatchReminders: boolean;
  updatedAt: string;
};
