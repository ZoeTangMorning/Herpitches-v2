// 评论状态来自审核流程：pending 是待审核，approved 才会公开展示。
export type CommentStatus = "pending" | "approved" | "rejected" | "deleted";

// 页面组件只使用这个内部评论类型，不直接依赖 Supabase 的数据库列名。
export type CommentRecord = {
  id: string;
  articleId: string;
  parentId?: string;
  authorName: string;
  content: string;
  status: CommentStatus;
  isOwn: boolean;
  likeCount: number;
  likedByMe: boolean;
  createdAt: string;
  updatedAt: string;
  replies: CommentRecord[];
};

// 文章和评论都可以点赞，所以目标类型必须明确区分。
export type LikeTargetType = "article" | "comment";

export type LikeState = {
  targetType: LikeTargetType;
  targetId: string;
  likeCount: number;
  likedByMe: boolean;
};

// 举报原因使用固定枚举，方便后续人工审核时分类查看。
export type ReportReason = "spam" | "abuse" | "misinformation" | "other";

export type ReportRecord = {
  id: string;
  commentId: string;
  reason: ReportReason;
  detail?: string;
  createdAt: string;
};

// 表单提交给内部 API 的最小评论数据。
export type CommentInput = {
  articleId: string;
  content: string;
  parentId?: string;
};

// 举报提交只针对评论，不针对整篇新闻。
export type ReportInput = {
  commentId: string;
  reason: ReportReason;
  detail?: string;
};
