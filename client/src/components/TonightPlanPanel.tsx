// 「今晚最终方案」聚合页（#/tonight-plan）
// 用户在 #/solo 或 #/family-tonight 点击「就按这个」之后，结果会沉淀成一份
// 结构化的最终方案，用户在这里一眼看清今晚的所有决定，并能复制 / 再生成 / 继续完善。

import { useEffect, useMemo, useState } from "react";
import {
  Sparkles,
  ChefHat,
  RefreshCw,
  ClipboardCopy,
  CheckCircle2,
  Wallet,
  Flame,
  Heart,
  ChevronRight,
  Users,
  Refrigerator,
  Repeat,
  CalendarDays,
  HeartPulse,
  Snowflake,
  ShoppingCart,
  ScrollText,
  ShieldCheck,
  AlertTriangle,
  Coffee,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

import {
  useTonightPlan,
  formatTonightPlanText,
  clearTonightPlan,
  type TonightPlan,
} from "@/lib/tonightPlan";
import { addShoppingItems } from "@/lib/shoppingList";

interface DeepLinkDef {
  testId: string;
  icon: React.ReactNode;
  label: string;
  hint: string;
  hash: string;
}

const SOLO_DEEP_LINKS: DeepLinkDef[] = [
  {
    testId: "tonight-link-solo",
    icon: <RefreshCw className="h-4 w-4" />,
    label: "再换一份",
    hint: "回到一键安排",
    hash: "#/solo",
  },
  {
    testId: "tonight-link-health",
    icon: <HeartPulse className="h-4 w-4" />,
    label: "看看健康",
    hint: "热量·油盐",
    hash: "#/health",
  },
  {
    testId: "tonight-link-snacks",
    icon: <ShoppingCart className="h-4 w-4" />,
    label: "再买点零食",
    hint: "便利店清单",
    hash: "#/snacks",
  },
  {
    testId: "tonight-link-shopping",
    icon: <ShoppingCart className="h-4 w-4" />,
    label: "购物清单",
    hint: "缺料汇总",
    hash: "#/shopping",
  },
  {
    testId: "tonight-link-companion",
    icon: <ScrollText className="h-4 w-4" />,
    label: "聊点啥",
    hint: "饭桌话题",
    hash: "#/companion",
  },
];

const FAMILY_DEEP_LINKS: DeepLinkDef[] = [
  {
    testId: "tonight-link-family-tonight",
    icon: <RefreshCw className="h-4 w-4" />,
    label: "再来一组",
    hint: "回到一家人",
    hash: "#/family-tonight",
  },
  {
    testId: "tonight-link-fridge",
    icon: <Refrigerator className="h-4 w-4" />,
    label: "冰箱有啥",
    hint: "补充库存",
    hash: "#/fridge",
  },
  {
    testId: "tonight-link-leftover",
    icon: <Repeat className="h-4 w-4" />,
    label: "剩菜变花样",
    hint: "明天用上",
    hash: "#/leftover",
  },
  {
    testId: "tonight-link-weekly",
    icon: <CalendarDays className="h-4 w-4" />,
    label: "一周菜单",
    hint: "规划全周",
    hash: "#/weekly",
  },
  {
    testId: "tonight-link-family-shopping",
    icon: <ShoppingCart className="h-4 w-4" />,
    label: "购物清单",
    hint: "缺料汇总",
    hash: "#/shopping",
  },
];

export function TonightPlanPanel() {
  const plan = useTonightPlan();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [fallback, setFallback] = useState<string | null>(null);

  useEffect(() => {
    setCopied(false);
    setFallback(null);
  }, [plan?.createdAt]);

  if (!plan) {
    return <EmptyState />;
  }

  return (
    <PlanView
      plan={plan}
      copied={copied}
      fallback={fallback}
      onCopy={async () => {
        const text = formatTonightPlanText(plan);
        try {
          if (navigator?.clipboard?.writeText) {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setFallback(null);
            toast({
              title: "已复制方案 ✓",
              description: "可以直接粘贴到聊天 / 备忘录。",
            });
            return;
          }
          throw new Error("no-clipboard");
        } catch {
          // 兜底：展示一段可手动选中复制的文本
          setFallback(text);
          setCopied(false);
          toast({
            title: "无法自动复制",
            description: "下方已展示方案文本，请长按全选手动复制。",
          });
        }
      }}
      onRegenerate={() => {
        const target = plan.kind === "solo" ? "#/solo" : "#/family-tonight";
        if (typeof window !== "undefined") window.location.hash = target;
      }}
      onClearFallback={() => setFallback(null)}
      onClear={() => {
        clearTonightPlan();
        toast({ title: "已清空今晚最终方案" });
      }}
    />
  );
}

function EmptyState() {
  function go(hash: string) {
    if (typeof window !== "undefined") window.location.hash = hash;
  }
  return (
    <section className="mt-2 space-y-4" data-testid="tonight-plan-empty">
      <div className="relative overflow-hidden rounded-3xl border border-primary/30 bg-gradient-to-br from-rose-50 via-orange-50 to-emerald-50 px-5 py-6 sm:px-7">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br from-rose-200/60 to-emerald-200/40 blur-2xl"
        />
        <div className="relative">
          <p className="inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.2em] text-primary/85">
            <Sparkles className="h-3 w-3" />
            今晚最终方案
          </p>
          <h2 className="mt-2 font-display text-[1.6rem] leading-tight tracking-tight text-foreground sm:text-[1.9rem]">
            还没有今晚的最终方案
          </h2>
          <p className="mt-2 max-w-xl text-[13.5px] leading-relaxed text-foreground/75 sm:text-[14.5px]">
            到「单人一键」或「一家人今晚」生成一份方案后，点「就按这个」就会沉淀到这里 ——
            一张可复制 / 可分享 / 可继续完善的最终答案卡片。
          </p>
        </div>
      </div>
      <Card className="grain border-card-border/60 bg-card/70 p-4 sm:p-5">
        <div className="grid gap-2 sm:grid-cols-2">
          <Button
            type="button"
            size="lg"
            className="h-12 gap-2 rounded-full"
            onClick={() => go("#/solo")}
            data-testid="tonight-empty-solo"
          >
            <Sparkles className="h-4 w-4" />
            单人一键安排今晚
          </Button>
          <Button
            type="button"
            size="lg"
            variant="outline"
            className="h-12 gap-2 rounded-full"
            onClick={() => go("#/family-tonight")}
            data-testid="tonight-empty-family"
          >
            <Users className="h-4 w-4" />
            一家人今晚吃什么
          </Button>
        </div>
      </Card>
    </section>
  );
}

function PlanView({
  plan,
  copied,
  fallback,
  onCopy,
  onRegenerate,
  onClearFallback,
  onClear,
}: {
  plan: TonightPlan;
  copied: boolean;
  fallback: string | null;
  onCopy: () => void;
  onRegenerate: () => void;
  onClearFallback: () => void;
  onClear: () => void;
}) {
  const { toast } = useToast();
  const date = useMemo(() => {
    try {
      const d = new Date(plan.createdAt);
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      const hh = String(d.getHours()).padStart(2, "0");
      const mm = String(d.getMinutes()).padStart(2, "0");
      return `${d.getFullYear()}-${m}-${day} ${hh}:${mm}`;
    } catch {
      return "";
    }
  }, [plan.createdAt]);

  const deepLinks = plan.kind === "solo" ? SOLO_DEEP_LINKS : FAMILY_DEEP_LINKS;
  const heroBg =
    plan.kind === "solo"
      ? "border-rose-200/70 from-rose-50 via-orange-50 to-amber-50"
      : "border-emerald-200/70 from-emerald-50 via-teal-50 to-cyan-50";
  const heroAccent =
    plan.kind === "solo" ? "text-rose-700/85" : "text-emerald-700/85";
  const compatMeta = compatBadgeMeta(plan.familyCompat);

  return (
    <section className="mt-2 space-y-4" data-testid="tonight-plan-panel">
      {/* Hero */}
      <div
        className={`relative overflow-hidden rounded-3xl border bg-gradient-to-br px-5 py-6 sm:px-7 ${heroBg}`}
        data-testid="tonight-plan-hero"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br from-white/70 to-white/20 blur-2xl"
        />
        <div className="relative">
          <p
            className={`inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.2em] ${heroAccent}`}
          >
            <Sparkles className="h-3 w-3" />
            今晚最终方案
          </p>
          <h2
            className="mt-2 font-display text-[1.7rem] leading-tight tracking-tight text-foreground sm:text-[2rem]"
            data-testid="tonight-plan-title"
          >
            {plan.title}
          </h2>
          <p
            className="mt-1 text-[12.5px] text-foreground/75"
            data-testid="tonight-plan-audience"
          >
            {plan.audience}
            {date && <span className="ml-2 text-muted-foreground num">{date}</span>}
          </p>
          {plan.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1" data-testid="tonight-plan-tags">
              {plan.tags.map((t) => (
                <Badge
                  key={t}
                  variant="outline"
                  className="rounded-full border-border/60 bg-white/60 px-2 py-0 text-[10.5px]"
                >
                  {t}
                </Badge>
              ))}
            </div>
          )}
          {plan.quote && (
            <p
              className="mt-2 inline-flex items-center gap-1 text-[12.5px] text-foreground/80"
              data-testid="tonight-plan-quote"
            >
              <Heart className="h-3 w-3 text-rose-500" />
              {plan.quote}
            </p>
          )}
        </div>
      </div>

      {/* 主卡：分区 */}
      <Card
        className="grain border-card-border/70 bg-card/80 p-5 sm:p-6"
        data-testid="tonight-plan-card"
      >
        <div className="space-y-3">
          {plan.lines.map((ln, i) => (
            <PlanLineRow key={`${ln.label}-${i}`} line={ln} index={i} />
          ))}
        </div>

        {/* 家庭兼容 / 冰箱 / 剩菜 / 明天 */}
        {(plan.familyCompat ||
          (plan.familyCompatLines && plan.familyCompatLines.length > 0) ||
          (plan.fridgeMatched && plan.fridgeMatched.length > 0) ||
          (plan.fridgeMissing && plan.fridgeMissing.length > 0) ||
          plan.remixHint ||
          plan.tomorrowHint) && (
          <div className="mt-4 space-y-2" data-testid="tonight-plan-extras">
            {compatMeta && (
              <InfoRow
                testId="tonight-plan-compat"
                icon={compatMeta.icon}
                title={`家庭兼容 · ${compatMeta.text}`}
                tone={compatMeta.tone}
              >
                {plan.familyCompatLines && plan.familyCompatLines.length > 0 ? (
                  <ul className="space-y-0.5 text-[11.5px] text-foreground/70">
                    {plan.familyCompatLines.map((l) => (
                      <li key={l}>• {l}</li>
                    ))}
                  </ul>
                ) : null}
              </InfoRow>
            )}
            {(plan.fridgeMatched?.length || plan.fridgeMissing?.length) && (
              <InfoRow
                testId="tonight-plan-fridge"
                icon={<Snowflake className="h-4 w-4" />}
                title="冰箱情况"
                tone="default"
              >
                {plan.fridgeMatched && plan.fridgeMatched.length > 0 && (
                  <p className="text-[11.5px] text-emerald-700">
                    ✓ 现有：{plan.fridgeMatched.join(" · ")}
                  </p>
                )}
                {plan.fridgeMissing && plan.fridgeMissing.length > 0 && (
                  <>
                    <p className="text-[11.5px] text-amber-700">
                      还需买：{plan.fridgeMissing.join(" · ")}
                    </p>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          const r = addShoppingItems(
                            (plan.fridgeMissing ?? []).map((m) => ({
                              name: m,
                              source: "tonight-plan",
                              note: plan.title,
                            })),
                          );
                          const desc =
                            r.added > 0 && r.merged > 0
                              ? `新增 ${r.added} 项 · 合并 ${r.merged} 项`
                              : r.merged > 0
                                ? `合并 ${r.merged} 项到已有清单`
                                : `已加入 ${r.added} 项`;
                          toast({ title: "已加入购物清单 ✓", description: desc });
                        }}
                        className="inline-flex items-center gap-1 rounded-full border border-primary/40 bg-primary/10 px-2.5 py-1 text-[11px] font-medium text-primary hover-elevate active-elevate-2"
                        data-testid="tonight-plan-add-shopping"
                      >
                        <ShoppingCart className="h-3 w-3" />
                        加入购物清单
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (typeof window !== "undefined") window.location.hash = "#/shopping";
                        }}
                        className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-2.5 py-1 text-[11px] hover-elevate active-elevate-2"
                        data-testid="tonight-plan-view-shopping"
                      >
                        查看购物清单
                      </button>
                    </div>
                  </>
                )}
              </InfoRow>
            )}
            {plan.remixHint && (
              <InfoRow
                testId="tonight-plan-remix"
                icon={<Repeat className="h-4 w-4" />}
                title="剩菜改造"
                tone="default"
              >
                <p className="text-[11.5px] text-foreground/80">{plan.remixHint}</p>
              </InfoRow>
            )}
            {plan.tomorrowHint && (
              <InfoRow
                testId="tonight-plan-tomorrow"
                icon={<CalendarDays className="h-4 w-4" />}
                title="明天衔接"
                tone="default"
              >
                <p className="text-[11.5px] text-foreground/80">{plan.tomorrowHint}</p>
              </InfoRow>
            )}
          </div>
        )}

        {/* 预算 / 热量 */}
        {(typeof plan.budget === "number" || typeof plan.calories === "number") && (
          <div
            className="mt-4 flex flex-wrap items-center gap-3 rounded-xl border border-border/60 bg-background/60 px-3 py-2.5 text-[12.5px]"
            data-testid="tonight-plan-totals"
          >
            {typeof plan.budget === "number" && (
              <span className="num inline-flex items-center gap-1">
                <Wallet className="h-3.5 w-3.5 text-primary" />
                预算估算 ¥{plan.budget}
              </span>
            )}
            {typeof plan.calories === "number" && (
              <span className="num inline-flex items-center gap-1">
                <Flame className="h-3.5 w-3.5 text-primary" />
                热量估算 ≈ {plan.calories} kcal
              </span>
            )}
          </div>
        )}

        {/* 主操作 */}
        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          <Button
            type="button"
            className="h-12 flex-1 gap-2 rounded-full"
            onClick={onCopy}
            data-testid="tonight-plan-copy"
          >
            {copied ? (
              <>
                <CheckCircle2 className="h-4 w-4" />
                已复制 ✓
              </>
            ) : (
              <>
                <ClipboardCopy className="h-4 w-4" />
                复制方案
              </>
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="h-12 gap-2 rounded-full"
            onClick={onRegenerate}
            data-testid="tonight-plan-regenerate"
          >
            <RefreshCw className="h-4 w-4" />
            再生成
          </Button>
        </div>

        {fallback && (
          <div
            className="mt-3 rounded-xl border border-amber-300/70 bg-amber-50/60 p-3 text-[12px]"
            data-testid="tonight-plan-copy-fallback"
          >
            <p className="mb-1 inline-flex items-center gap-1 text-amber-800">
              <ClipboardCopy className="h-3.5 w-3.5" />
              浏览器拒绝了自动复制 — 请长按下面的文本全选手动复制：
            </p>
            <textarea
              readOnly
              value={fallback}
              className="h-44 w-full resize-none rounded-md border border-amber-300/60 bg-white/80 p-2 font-mono text-[11.5px] leading-relaxed text-foreground"
              data-testid="tonight-plan-copy-fallback-text"
              onFocus={(e) => e.currentTarget.select()}
            />
            <button
              type="button"
              onClick={onClearFallback}
              className="mt-1 text-[11px] text-amber-700 underline-offset-2 hover:underline"
              data-testid="tonight-plan-copy-fallback-close"
            >
              收起
            </button>
          </div>
        )}

        {/* 继续完善 */}
        <div
          className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4"
          data-testid="tonight-plan-deep-links"
        >
          {deepLinks.map((d) => (
            <button
              key={d.testId}
              type="button"
              data-testid={d.testId}
              onClick={() => {
                if (typeof window !== "undefined") window.location.hash = d.hash;
              }}
              className="flex items-center gap-2 rounded-xl border border-border/60 bg-background/80 px-3 py-2.5 text-left transition-colors hover-elevate active-elevate-2 hover:border-primary/40"
            >
              <span className="text-primary">{d.icon}</span>
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="text-[12.5px] font-medium text-foreground">{d.label}</span>
                <span className="text-[10.5px] text-muted-foreground">{d.hint}</span>
              </span>
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={onClear}
          className="mt-4 text-[11px] text-muted-foreground hover:text-foreground hover:underline"
          data-testid="tonight-plan-clear"
        >
          清空这份方案
        </button>
      </Card>
    </section>
  );
}

function PlanLineRow({ line, index }: { line: TonightPlan["lines"][number]; index: number }) {
  const Icon = iconForLabel(line.label);
  return (
    <div
      className="flex items-start gap-2.5 rounded-xl border border-border/60 bg-background/70 px-3 py-2.5"
      data-testid={`tonight-plan-line-${index}`}
    >
      <span className="mt-0.5 inline-flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Icon className="h-3.5 w-3.5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[10.5px] font-medium uppercase tracking-wider text-muted-foreground">
          {line.label}
        </p>
        <p className="text-[14px] font-medium text-foreground">{line.text}</p>
        {line.detail && (
          <p className="mt-0.5 text-[11.5px] text-muted-foreground">{line.detail}</p>
        )}
        {line.link && (
          <a
            href={line.link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 inline-block text-[11px] text-primary hover:underline"
          >
            → {line.link.label}
          </a>
        )}
      </div>
    </div>
  );
}

function InfoRow({
  testId,
  icon,
  title,
  tone,
  children,
}: {
  testId: string;
  icon: React.ReactNode;
  title: string;
  tone: "default" | "amber" | "rose" | "emerald";
  children?: React.ReactNode;
}) {
  const toneCls =
    tone === "amber"
      ? "border-amber-300/70 bg-amber-50/60"
      : tone === "rose"
        ? "border-rose-300/70 bg-rose-50/60"
        : tone === "emerald"
          ? "border-emerald-300/70 bg-emerald-50/60"
          : "border-border/60 bg-background/70";
  return (
    <div
      className={`flex items-start gap-2 rounded-xl border px-3 py-2.5 text-[12.5px] ${toneCls}`}
      data-testid={testId}
    >
      <span className="mt-0.5 flex-shrink-0 text-primary">{icon}</span>
      <div className="min-w-0 flex-1">
        <p className="font-medium text-foreground/85">{title}</p>
        {children}
      </div>
    </div>
  );
}

function compatBadgeMeta(level?: TonightPlan["familyCompat"]):
  | { icon: React.ReactNode; text: string; tone: "default" | "amber" | "rose" | "emerald" }
  | null {
  if (!level) return null;
  if (level === "red") {
    return {
      icon: <AlertTriangle className="h-4 w-4" />,
      text: "注意冲突",
      tone: "rose",
    };
  }
  if (level === "amber") {
    return {
      icon: <ShieldCheck className="h-4 w-4" />,
      text: "部分兼容",
      tone: "amber",
    };
  }
  return {
    icon: <ShieldCheck className="h-4 w-4" />,
    text: "全家兼容",
    tone: "emerald",
  };
}

function iconForLabel(label: string) {
  if (label.includes("外卖")) return Sparkles;
  if (label.includes("主菜") || label.includes("主餐") || label.includes("做饭") || label.includes("做")) return ChefHat;
  if (label.includes("配菜") || label.includes("素") || label.includes("蔬"))
    return ScrollText;
  if (label.includes("汤") || label.includes("主食")) return ChefHat;
  if (label.includes("零食")) return ShoppingCart;
  if (label.includes("水果")) return ShoppingCart;
  if (label.includes("喝") || label.includes("饮料") || label.includes("饮"))
    return Coffee;
  if (label.includes("看")) return ScrollText;
  if (label.includes("听")) return ScrollText;
  return Sparkles;
}
