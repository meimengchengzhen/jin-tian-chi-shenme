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
  ChevronLeft,
  ChevronRight,
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
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const dragRef = useRef<{ active: boolean; startX: number; startLeft: number; moved: boolean }>({
    active: false, startX: 0, startLeft: 0, moved: false,
  });

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
      setCanScrollLeft(el.scrollLeft > 4);
    };
    update();
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  // v2.1: 鼠标横向拖拽 — 只在「鼠标按下并真正拖动」时启用；
  // 普通点击 / 触摸滚动一律不参与，避免 setPointerCapture 把 click 抢走。
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const DRAG_THRESHOLD = 6;
    const onPointerDown = (e: PointerEvent) => {
      // 只对鼠标左键参与拖拽。触摸/笔走原生横滑（touch-action: pan-x），不拦截。
      if (e.pointerType !== "mouse") return;
      if (e.button !== 0) return;
      // 如果按到的是按钮（Tab 按钮），完全不接管，避免误判 drag 偷走 click
      const tgt = e.target as Element | null;
      if (tgt && tgt.closest("button")) return;
      dragRef.current = {
        active: true,
        startX: e.clientX,
        startLeft: el.scrollLeft,
        moved: false,
      };
      el.style.cursor = "grabbing";
    };
    const onPointerMove = (e: PointerEvent) => {
      const d = dragRef.current;
      if (!d.active) return;
      const dx = e.clientX - d.startX;
      if (!d.moved && Math.abs(dx) <= DRAG_THRESHOLD) return; // 还没到阈值，按"未拖动"处理
      if (!d.moved) d.moved = true;
      el.scrollLeft = d.startLeft - dx;
    };
    const onPointerUp = () => {
      const d = dragRef.current;
      if (!d.active) return;
      d.active = false;
      el.style.cursor = "";
      // 只有真正拖动过才短暂屏蔽 click，避免拖完释放误点中按钮
      if (d.moved) {
        const blockClick = (ev: Event) => {
          ev.preventDefault();
          ev.stopPropagation();
          window.removeEventListener("click", blockClick, true);
        };
        window.addEventListener("click", blockClick, true);
        setTimeout(() => window.removeEventListener("click", blockClick, true), 60);
      }
    };
    el.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);
    return () => {
      el.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
    };
  }, []);

  // v2: 滚轮横向滚动（鼠标用户）
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      // 只在没有水平意图（deltaX 占主导）时把垂直滚轮转为横滚
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        if (el.scrollWidth - el.clientWidth > 0) {
          el.scrollLeft += e.deltaY;
          e.preventDefault();
        }
      }
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel as EventListener);
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

  function nudge(dir: -1 | 1) {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.max(180, el.clientWidth * 0.6), behavior: "smooth" });
  }

  return (
    <nav
      aria-label="主导航"
      data-testid="main-tabs"
      className="sticky top-[58px] z-20 -mx-4 mt-1 border-y border-border/50 bg-background/90 backdrop-blur-md sm:-mx-6 sm:top-[62px]"
    >
      <div className="relative">
        {/* 左侧渐变（视觉淡出） */}
        <div
          aria-hidden
          className={`pointer-events-none absolute left-0 top-0 z-10 h-full w-12 bg-gradient-to-r from-background to-transparent transition-opacity sm:w-14 ${
            canScrollLeft ? "opacity-100" : "opacity-0"
          }`}
        />
        {/* 左箭头：40x40 hit target，移动端也可见，圆形大按钮 */}
        {canScrollLeft && (
          <button
            type="button"
            aria-label="向左滚动 Tab"
            onClick={() => nudge(-1)}
            className="absolute left-1 top-1/2 z-20 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-border/80 bg-card text-foreground/85 shadow-md hover-elevate active-elevate-2 sm:left-2"
            data-testid="main-tabs-nudge-left"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}
        {/* 右侧渐变 */}
        <div
          aria-hidden
          className={`pointer-events-none absolute right-0 top-0 z-10 h-full w-12 bg-gradient-to-l from-background to-transparent transition-opacity sm:w-14 ${
            canScrollRight ? "opacity-100" : "opacity-0"
          }`}
        />
        {/* 右箭头 */}
        {canScrollRight && (
          <button
            type="button"
            aria-label="向右滚动 Tab"
            onClick={() => nudge(1)}
            className="absolute right-1 top-1/2 z-20 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-border/80 bg-card text-foreground/85 shadow-md hover-elevate active-elevate-2 sm:right-2"
            data-testid="main-tabs-nudge-right"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        )}
        <div
          ref={scrollerRef}
          className="no-scrollbar mx-auto flex items-center gap-1.5 overflow-x-auto px-12 py-2.5 sm:gap-2 sm:px-14 lg:px-14"
          style={{ cursor: "grab", touchAction: "pan-x", scrollSnapType: "x proximity", overscrollBehaviorX: "contain", WebkitOverflowScrolling: "touch" } as React.CSSProperties}
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
                style={{ scrollSnapAlign: "start" }}
                className={`group inline-flex h-11 shrink-0 select-none items-center justify-center gap-1.5 rounded-full border px-3.5 text-[14px] font-semibold tracking-tight transition-all hover-elevate active-elevate-2 ${
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
