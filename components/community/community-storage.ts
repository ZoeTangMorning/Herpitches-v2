import type { CommunityMeta } from "@/types/community";

export type { CommunityMeta };

export const HERPITCHES_COMMUNITY: CommunityMeta = {
  id: "herpitches",
  kind: "official",
  zhName: "herpitches 社区",
  enName: "HerPitches Community",
  avatarUrl: "/logo1.png",
};

export function createCommunityFromFollow(input: { targetType: "team" | "player"; targetId: string; targetName: string; targetAvatarUrl?: string }): CommunityMeta {
  const englishName = input.targetType === "team" ? input.targetName : input.targetName;
  return {
    id: `${input.targetType}-${input.targetId}`,
    kind: input.targetType,
    zhName: input.targetName,
    enName: englishName,
    avatarUrl: input.targetType === "player" ? input.targetAvatarUrl : undefined,
    badgeUrl: input.targetType === "team" ? input.targetAvatarUrl : undefined,
  };
}
