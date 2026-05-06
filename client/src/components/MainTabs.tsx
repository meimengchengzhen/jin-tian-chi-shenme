// 主 Tab 导航：拆分原本拥挤的单页，提供 7 个分区。
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
  Bike,
  Wand2,
  Cookie,
  Apple,
} from "lucide-react";

export type MainTabId =
  | "home"
  | "lazy"
  | "health"
  | "search"
  | "travel"
  | "takeout"
  | "snacks"
  | "fruit"
  | "companion"
  | "hotboard";

export interface MainTabDef {
  id: MainTabId;
  label: string;
  hint: string;
  icon: typeof Sparkles;
  /** 视觉分组（用于横向滚动时呈现轻分组背景） */
  group?: "core" | "lazy" | "extra";
}

// 10 个 Tab：横向滚动 + 大按钮，移动端不挤爆。新增「懒人决定 / 零食 / 水果」。
export const MAIN_TABS: MainTabDef[] = [
  { id: "home", label: "今日推荐", hint: "一桌", icon: Sparkles, group: "core" },
  { id: "lazy", label: "懒人决定", hint: "替你选", icon: Wand2, group: "lazy" },
  { id: "takeout", label: "外卖", hint: "品牌·凑券", icon: Bike, group: "core" },
  { id: "snacks", label: "零食", hint: "替你决定", icon: Cookie, group: "core" },
  { id: "fruit", label: "水果", hint: "应季", icon: Apple, group: "core" },
  { id: "health", label: "健康饮食", hint: "低糖低盐", icon: HeartPulse, group: "extra" },
  { id: "search", label: "菜谱搜索", hint: "按菜名", icon: Search, group: "extra" },
  { id: "travel", label: "旅行美食", hint: "城市", icon: Plane, group: "extra" },
  { id: "companion", label: "饭桌陪伴", hint: "看听聊", icon: Coffee, group: "extra" },
  { id: "hotboard", label: "饭桌热榜", hint: "本月", icon: Flame, group: "extra" },
];

const HASH_PREFIX = "#/";

function hashToTab(hash: string): MainTabId | null {
  if (hash === "" || hash === "#" || hash === "#/") return "home";
  if (!hash.startsWith(HASH_PREFIX)) return null;
  const id = hash.slice(HASH_PREFIX.length);
  return MAIN_TABS.some((t) => t.id === id) ? (id as MainTabId) : null;
}

export function loadTabFromHash(): MainTabId {
  if (typeof window === "undefined") return "home";
  const fromHash = hashToTab(window.location.hash);
  if (typeof window !== "undefined") {
    const h = window.location.hash;
    if (h === "" || h === "#" || h === "#/") {
      try {
        window.history.replaceState(null, "", `${HASH_PREFIX}home`);
      } catch {}
    }
  }
  return fromHash ?? "home";
}

interface Props {
  active: MainTabId;
  onChange: (id: MainTabId) => void;
}

/** 顶部 Tab 导航条（更醒目版）：
 *  - 桌面 lg+（≥1024px）：7 等分网格，按钮变高变胖、字号更大。
 *    1366px 桌面 7 个全部可见。副标题在 xl+（≥1280px）显示。
 *  - 移动端：横向滚动 + 右侧渐变提示。每个按钮加大到 h-11，字号 14px。
 */
export function MainTabsNav({ active, onChange }: Props) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const onHashChange = () => {
      const next = hashToTab(window.location.hash);
      if (next && next !== active) onChange(next);
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, [active, onChange]);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const update = () => {
      const more = el.scrollWidth - el.clientWidth - el.scrollLeft > 4;
      setCanScrollRight(more);
    };
    update();
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  function handleClick(id: MainTabId) {
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", `${HASH_PREFIX}${id}`);
    }
    onChange(id);
    setTimeout(() => {
      const el = document.getElementById("tab-content-anchor");
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 30);
  }

  return (
    <nav
      aria-label="主导航"
      data-testid="main-tabs"
      className="sticky top-[58px] z-20 -mx-4 mt-1 border-y border-border/50 bg-background/90 backdrop-blur-md sm:-mx-6 sm:top-[62px]"
    >
      <div className="relative">
        <div
          aria-hidden
          className={`pointer-events-none absolute right-0 top-0 z-10 h-full w-10 bg-gradient-to-l from-background/95 to-transparent transition-opacity lg:hidden ${
            canScrollRight ? "opacity-100" : "opacity-0"
          }`}
        />
        <div
          ref={scrollerRef}
          className="no-scrollbar mx-auto flex items-center gap-1.5 overflow-x-auto px-3 py-2.5 sm:gap-2 sm:px-5 lg:px-6"
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
                className={`group inline-flex h-11 shrink-0 items-center justify-center gap-1.5 rounded-full border px-3.5 text-[14px] font-semibold tracking-tight transition-all hover-elevate active-elevate-2 ${
                  isActive
                    ? "border-primary/60 bg-primary text-primary-foreground shadow-md shadow-primary/25 scale-[1.02]"
                    : "border-border/70 bg-card/70 text-foreground/90"
                }`}
              >
                <ActiveIcon
                  className={`h-4 w-4 flex-shrink-0 ${isActive ? "" : "text-primary"}`}
                />
                <span className="whitespace-nowrap">{t.label}</span>
                <span
                  className={`hidden whitespace-nowrap text-[11px] font-normal xl:inline ${
                    isActive ? "text-primary-foreground/80" : "text-muted-foreground"
                  }`}
                >
                  · {t.hint}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
