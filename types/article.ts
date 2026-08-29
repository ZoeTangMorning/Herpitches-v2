export type ArticleType = "news" | "feature" | "profile" | "tactics";

export type ArticleRelation = {
  teamId?: string;
  teamName?: string;
  playerId?: string;
  playerName?: string;
  matchId?: string;
  matchLabel?: string;
};

export type Article = {
  id: string;
  title: string;
  summary: string;
  content: string;
  type: ArticleType;
  coverUrl?: string;
  publishedAt: string;
  updatedAt?: string;
  authorName?: string;
  isPinned?: boolean;
  commentsCount?: number;
  reactionsCount?: number;
  relations: ArticleRelation[];
};

export type ArticleQuery = {
  keyword?: string;
  type?: ArticleType | "all";
  teamId?: string;
};
