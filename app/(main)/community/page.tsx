import { CommunityBoard } from "@/components/community/community-board";
import { HERPITCHES_COMMUNITY, type CommunityMeta } from "@/components/community/community-storage";
import { getCommunityContext } from "@/lib/supabase/community-context";

export const metadata = { title: "社区" };
export const dynamic = "force-dynamic";

export default async function CommunityPage() {
  const context = await getCommunityContext();
  const initialCommunities: CommunityMeta[] = context.user ? [HERPITCHES_COMMUNITY] : [];

  return (
    <section className="space-y-5 py-4">
      <CommunityBoard initialCommunities={initialCommunities} isLoggedIn={Boolean(context.user)} />
    </section>
  );
}
