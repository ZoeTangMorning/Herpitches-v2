import { CommunityBoard } from "@/components/community/community-board";
import { createCommunityFromFollow, HERPITCHES_COMMUNITY } from "@/components/community/community-storage";
import { getCommunityContext } from "@/lib/supabase/community-context";
import { getCommunityPosts } from "@/lib/supabase/post-queries";
import { getMyFollows } from "@/lib/supabase/queries";
import type { CommunityMeta } from "@/types/community";

export const metadata = { title: "社区" };
export const dynamic = "force-dynamic";

export default async function CommunityPage() {
  const context = await getCommunityContext();
  const follows = context.user ? await getMyFollows({ client: context.client, user: context.user }) : { data: [] };
  const followedCommunities: CommunityMeta[] = follows.data.flatMap((follow) => {
    if (follow.targetType !== "team" && follow.targetType !== "player") return [];
    return [createCommunityFromFollow({
      targetType: follow.targetType,
      targetId: follow.targetId,
      targetName: follow.targetName,
      targetAvatarUrl: follow.targetType === "team" ? `/images/team-badges/${follow.targetId}.png` : undefined,
    })];
  });
  const initialCommunities: CommunityMeta[] = [HERPITCHES_COMMUNITY, ...followedCommunities];
  const posts = await getCommunityPosts(context, HERPITCHES_COMMUNITY.id);

  return (
    <section className="space-y-5 py-4">
      <CommunityBoard initialCommunities={initialCommunities} initialPosts={posts.data} isLoggedIn={Boolean(context.user)} />
    </section>
  );
}
