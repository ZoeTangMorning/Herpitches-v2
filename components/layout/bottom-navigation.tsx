"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { House, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { mobileShellClassName } from "@/components/layout/mobile-shell";
import { navigationItems } from "@/lib/constants/navigation";
import type { UserProfile } from "@/types/user";

type ProfileState = "loading" | "guest" | "needs-main-team" | "has-main-team";

// 移动端底部导航固定在视口底部，外层页面会预留同等高度避免内容被遮住。
export function BottomNavigation() {
  const pathname = usePathname();
  const [state, setState] = useState<ProfileState>("loading");
  const [profile, setProfile] = useState<UserProfile | null | undefined>(undefined);
  const [teamName, setTeamName] = useState("");

  useEffect(() => {
    let cancelled = false;
    if (!hasSupabaseSessionCookie()) {
      setState("guest");
      setProfile(null);
      return () => {
        cancelled = true;
      };
    }
    fetch("/api/profile")
      .then(async (response) => {
        if (response.status === 401) return null;
        return response.ok ? response.json() : null;
      })
      .then(async (payload) => {
        if (cancelled) return;
        if (!payload) {
          setState("guest");
          setProfile(null);
          return;
        }
        const nextProfile = payload?.data as UserProfile | null | undefined;
        setProfile(nextProfile ?? null);
        if (!nextProfile?.mainTeamId) {
          setState("needs-main-team");
          return;
        }
        setState("has-main-team");
        const teamResponse = await fetch(`/api/wsl/teams?teamId=${encodeURIComponent(nextProfile.mainTeamId)}`);
        const teamPayload = teamResponse.ok ? await teamResponse.json() : null;
        if (!cancelled && teamPayload?.data?.id === nextProfile.mainTeamId) setTeamName(teamPayload.data.name ?? "");
      })
      .catch(() => {
        if (!cancelled) setState("guest");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <nav aria-label="主导航" className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-white">
      <div className={`${mobileShellClassName} grid grid-cols-5`}>
        {navigationItems.map((item) => {
          const href = item.href === "/club" && state === "needs-main-team" ? "/club/select" : item.href;
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={item.href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`flex min-h-16 flex-col items-center justify-center gap-1 text-xs font-semibold ${
                active ? "text-brand" : "text-muted"
              }`}
            >
              {item.href === "/club" ? <ClubMark state={state} profile={profile} teamName={teamName} active={active} /> : <item.icon aria-hidden="true" size={20} strokeWidth={active ? 2.5 : 2} />}
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

function ClubMark({ state, profile, teamName, active }: { state: ProfileState; profile: UserProfile | null | undefined; teamName: string; active: boolean }) {
  if (state === "has-main-team" && profile?.mainTeamId && teamName) {
    return <span className={`flex h-5 min-w-5 items-center justify-center rounded bg-brand px-1 text-[10px] font-black text-white ${active ? "ring-2 ring-focus" : ""}`}>{shortName(teamName)}</span>;
  }
  if (state === "needs-main-team") return <Plus aria-hidden="true" size={20} strokeWidth={active ? 2.5 : 2} />;
  return <House aria-hidden="true" size={20} strokeWidth={active ? 2.5 : 2} />;
}

function shortName(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length > 1) return words.map((word) => word[0]).join("").slice(0, 2).toUpperCase();
  return name.trim().slice(0, 2).toUpperCase();
}

function hasSupabaseSessionCookie() {
  if (typeof document === "undefined") return false;
  return document.cookie.split(";").some((item) => item.trim().includes("-auth-token="));
}
