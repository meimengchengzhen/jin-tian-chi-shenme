// 主 Tab 导航：拆分原本拥挤的单页，提供 11 个分区。
// 切换不全量卸载（保持收藏/历史/筛选状态），但仅展示当前 tab 的内容区。
// 状态持久化到 hash（#/home, #/health, ...），便于分享与浏览器后退。
//
// v8: 桌面/平板两排大按钮布局；移动端两排网格 fallback；不再依赖横向拖动即可看到所有入口。

import { useEffect } from "react";
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
  CalendarDays,
} from "lucide-react";

export type MainTabId =
  | "home"
  | "weekly"
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

// 11 个 Tab：两排网格布局，第一排核心入口，第二排扩展功能。
export const MAIN_TABS: MainTabDef[] = [
  // 第一排：核心入口（决定吃啥 / 一周菜单 / 外卖 / 零食 / 水果）
  { id: "home", label: "今日推荐", hint: "一桌", icon: Sparkles, group: "core" },
  { id: "weekly", label: "一周菜单", hint: "家庭+预算", icon: CalendarDays, group: "core" },
  { id: "lazy", label: "懒人决定", hint: "替你选", icon: Wand2, group: "lazy" },
  { id: "takeout", label: "外卖", hint: "品牌·凑券", icon: Bike, group: "core" },
  { id: "snacks", label: "零食", hint: "替你决定", icon: Cookie, group: "core" },
  { id: "fruit", label: "水果", hint: "应季", icon: Apple, group: "core" },
  // 第二排：扩展功能（健康 / 搜索 / 旅行 / 陪伴 / 热榜）
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

/** 顶部 Tab 导航条（普通文档流版）：
 *  - sm+（≥640px）：两排网格，第一排 6 列，第二排 5 列；按钮高 h-12，字号 14.5。
 *  - 移动端（<640px）：两排网格 grid-cols-3，按钮 h-12 全部可见，无需横滑。
 *  - 不再 sticky / fixed：向下滚动会自然离开视口，避免遮挡内容。
 */
export function MainTabsNav({ active, onChange }: Props) {
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
    setTimeout(() => {
      const el = document.getElementById("tab-content-anchor");
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 30);
  }

  // 第一排 / 第二排
  const row1 = MAIN_TABS.filter((t) => t.group !== "extra");
  const row2 = MAIN_TABS.filter((t) => t.group === "extra");

  return (
    <nav
      aria-label="主导航"
      data-testid="main-tabs"
      className="relative z-10 -mx-4 mt-1 border-y border-border/50 bg-background sm:-mx-6"
    >
      <div className="mx-auto px-2 py-2.5 sm:px-3" data-testid="main-tabs-grid">
        <TabRow tabs={row1} active={active} onClick={handleClick} cols={row1.length} />
        <div className="mt-2">
          <TabRow tabs={row2} active={active} onClick={handleClick} cols={row2.length} />
        </div>
        <p className="mt-1.5 text-center text-[10.5px] text-muted-foreground/80 sm:hidden">
          上排：决定吃啥 / 一周菜单 / 外卖 · 下排：健康 / 搜索 / 旅行 / 陪伴 / 热榜
        </p>
      </div>
    </nav>
  );
}

function TabRow({
  tabs,
  active,
  onClick,
}: {
  tabs: MainTabDef[];
  active: MainTabId;
  onClick: (id: MainTabId) => void;
  cols: number;
}) {
  // 用内联 CSS 变量 + 自定义类，在 mobile (<640px) 强制 3 列，sm+ 自动等分。
  return (
    <div
      data-testid="main-tabs-row"
      className="main-tabs-row"
      style={{
        ["--tab-cols" as any]: tabs.length,
      }}
    >
      {tabs.map((t) => {
        const Icon = t.icon;
        const isActive = t.id === active;
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => onClick(t.id)}
            data-testid={`tab-${t.id}`}
            aria-current={isActive ? "page" : undefined}
            className={`group inline-flex h-12 select-none items-center justify-center gap-1.5 rounded-xl border px-2.5 text-[14.5px] font-semibold tracking-tight transition-all hover-elevate active-elevate-2 sm:h-12 sm:px-3 ${
              isActive
                ? "border-primary/60 bg-primary text-primary-foreground shadow-md shadow-primary/25 scale-[1.02]"
                : "border-border/70 bg-card/70 text-foreground/90"
            }`}
          >
            <Icon
              className={`h-4 w-4 flex-shrink-0 sm:h-[17px] sm:w-[17px] ${isActive ? "" : "text-primary"}`}
            />
            <span className="whitespace-nowrap">{t.label}</span>
            <span
              className={`hidden whitespace-nowrap text-[11.5px] font-normal lg:inline ${
                isActive ? "text-primary-foreground/80" : "text-muted-foreground"
              }`}
            >
              · {t.hint}
            </span>
          </button>
        );
      })}
    </div>
  );
}
