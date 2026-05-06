// 主 Tab 导航：拆分原本拥挤的单页，提供 6 个分区。
// 切换不全量卸载（保持收藏/历史/筛选状态），但仅展示当前 tab 的内容区。
// 状态持久化到 hash（#/home, #/health, ...），便于分享与浏览器后退。

import { useEffect, useRef, useState } from "react";
import {
  Sparkles,
  HeartPulse,
  Search,
  Plane,
  Coffee,
  Flame,
} from "lucide-react";

export type MainTabId =
  | "home"
  | "health"
  | "search"
  | "travel"
  | "companion"
  | "hotboard";

export interface MainTabDef {
  id: MainTabId;
  label: string;
  hint: string;
  icon: typeof Sparkles;
}

export const MAIN_TABS: MainTabDef[] = [
  { id: "home", label: "今日推荐", hint: "随机一桌+热量", icon: Sparkles },
  { id: "health", label: "健康饮食", hint: "低糖低盐低嘌呤", icon: HeartPulse },
  { id: "search", label: "菜谱搜索", hint: "按菜名/食材", icon: Search },
  { id: "travel", label: "旅行美食", hint: "城市特色", icon: Plane },
  { id: "companion", label: "饭桌陪伴", hint: "看 / 听 / 聊", icon: Coffee },
  { id: "hotboard", label: "饭桌热榜", hint: "6 平台热榜", icon: Flame },
];

const HASH_PREFIX = "#/";

function hashToTab(hash: string): MainTabId | null {
  if (!hash.startsWith(HASH_PREFIX)) return null;
  const id = hash.slice(HASH_PREFIX.length);
  return MAIN_TABS.some((t) => t.id === id) ? (id as MainTabId) : null;
}

export function loadTabFromHash(): MainTabId {
  if (typeof window === "undefined") return "home";
  const fromHash = hashToTab(window.location.hash);
  return fromHash ?? "home";
}

interface Props {
  active: MainTabId;
  onChange: (id: MainTabId) => void;
}

/** 顶部 Tab 导航条：横向滚动 + 当前指示。 */
export function MainTabsNav({ active, onChange }: Props) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const onHashChange = () => {
      const next = hashToTab(window.location.hash);
      if (next && next !== active) onChange(next);
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, [active, onChange]);

  function handleClick(id: MainTabId) {
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", `${HASH_PREFIX}${id}`);
    }
    onChange(id);
    // 切 tab 后回到顶部主区域
    setTimeout(() => {
      const el = document.getElementById("tab-content-anchor");
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 30);
  }

  return (
    <nav
      aria-label="主导航"
      data-testid="main-tabs"
      className="sticky top-[58px] z-20 -mx-4 mt-1 border-y border-border/50 bg-background/85 backdrop-blur-md sm:-mx-6 sm:top-[62px]"
    >
      <div
        ref={scrollerRef}
        className="no-scrollbar mx-auto flex max-w-3xl items-center gap-1 overflow-x-auto px-4 py-2 sm:px-6"
      >
        {MAIN_TABS.map((t) => {
          const ActiveIcon = t.icon;
          const isActive = t.id === active;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => handleClick(t.id)}
              data-testid={`tab-${t.id}`}
              aria-current={isActive ? "page" : undefined}
              className={`group inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12.5px] font-medium transition-colors hover-elevate active-elevate-2 ${
                isActive
                  ? "border-primary/55 bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                  : "border-border/70 bg-card/60 text-foreground/85"
              }`}
            >
              <ActiveIcon
                className={`h-3.5 w-3.5 ${isActive ? "" : "text-primary"}`}
              />
              <span>{t.label}</span>
              <span
                className={`hidden text-[10.5px] sm:inline ${
                  isActive ? "text-primary-foreground/80" : "text-muted-foreground"
                }`}
              >
                · {t.hint}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
