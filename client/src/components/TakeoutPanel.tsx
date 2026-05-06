// 外卖优惠面板：基于「平台 + 预算金额范围 + 优惠策略 + 推荐品类 / 店铺类型 + 搜索入口」
// 静态站点无法实时拿美团/饿了么/抖音内部红包数据，因此本模块给出经验性建议 +
// 公开搜索入口，让使用者按预算范围快速决定吃什么、怎么凑券。
//
// 不调任何商户 API；外链统一是平台 H5 / 网页版搜索入口；不可达时也给百度兜底。

import { useMemo, useState } from "react";
import {
  Bike,
  Wallet,
  Sparkles,
  Users,
  AlertTriangle,
  ExternalLink,
  ChefHat,
  Receipt,
  ShoppingBag,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BUDGETS, PLATFORMS, type BudgetId } from "@/data/takeout";

export function TakeoutPanel() {
  const [budget, setBudget] = useState<BudgetId>("b25-40");
  const tier = useMemo(
    () => BUDGETS.find((b) => b.id === budget) ?? BUDGETS[2],
    [budget],
  );

  return (
    <section className="space-y-4" data-testid="takeout-panel">
      <header>
        <h2 className="font-display text-[1.7rem] tracking-tight">
          <Bike className="mb-1 mr-1 inline h-5 w-5 text-primary" />
          今天外卖吃什么
        </h2>
        <p className="mt-1 text-[14px] text-muted-foreground">
          按预算挑「平台 · 品类 · 凑券」组合 — 静态推荐不实时读取红包数据，仅给经验性建议与搜索入口。
        </p>
      </header>

      {/* 预算选择 */}
      <Card className="grain border-card-border/60 bg-card/70 p-4 sm:p-5">
        <div className="mb-3 flex items-baseline justify-between gap-2">
          <h3 className="font-display text-[1.1rem] tracking-tight">
            <Wallet className="mb-0.5 mr-1 inline h-4 w-4 text-primary" />
            预算金额
          </h3>
          <span className="text-[12px] text-muted-foreground">
            点击切换 · 共 {BUDGETS.length} 档
          </span>
        </div>
        <div
          className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap"
          data-testid="budget-tabs"
        >
          {BUDGETS.map((b) => {
            const active = b.id === budget;
            return (
              <button
                key={b.id}
                type="button"
                onClick={() => setBudget(b.id)}
                data-testid={`budget-${b.id}`}
                className={`inline-flex w-full items-center gap-2 rounded-full border px-4 py-2.5 text-[14px] font-medium transition-colors hover-elevate active-elevate-2 sm:w-auto ${
                  active
                    ? "border-primary/55 bg-primary text-primary-foreground shadow-md shadow-primary/20"
                    : "border-border bg-card/60 text-foreground/90"
                }`}
              >
                <span aria-hidden>💴</span>
                <span>{b.label}</span>
              </button>
            );
          })}
        </div>
        <p
          className="mt-3 text-[12.5px] text-muted-foreground"
          data-testid="budget-desc"
        >
          <Users className="mb-0.5 mr-1 inline h-3.5 w-3.5" />
          {tier.range} · {tier.for}
        </p>
      </Card>

      {/* 推荐品类 */}
      <Card className="grain border-card-border/60 bg-card/70 p-4 sm:p-5">
        <h3 className="mb-3 font-display text-[1.1rem] tracking-tight">
          <ChefHat className="mb-0.5 mr-1 inline h-4 w-4 text-primary" />
          这档预算适合点
        </h3>
        <div className="grid gap-2 sm:grid-cols-2" data-testid="takeout-picks">
          {tier.picks.map((p) => (
            <div
              key={p.name}
              className="flex gap-3 rounded-lg border border-border/60 bg-background/60 p-3"
              data-testid={`takeout-pick-${p.name}`}
            >
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-amber-100 to-rose-100 text-2xl">
                <span aria-hidden>{p.emoji}</span>
              </div>
              <div className="flex-1">
                <h4 className="font-display text-[15px] tracking-tight">{p.name}</h4>
                <p className="mt-0.5 text-[12.5px] leading-relaxed text-muted-foreground">
                  {p.reason}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* 凑券策略 + 风险 */}
      <div className="grid gap-3 sm:grid-cols-2">
        <Card className="border-emerald-500/30 bg-emerald-500/5 p-4">
          <h3 className="mb-2 font-display text-[1.05rem] tracking-tight text-emerald-700">
            <Receipt className="mb-0.5 mr-1 inline h-4 w-4" />
            怎么凑券
          </h3>
          <ul className="space-y-1.5 text-[13px] leading-relaxed text-foreground/85">
            {tier.coupon.map((c, i) => (
              <li key={i} className="flex items-start gap-1.5">
                <Sparkles className="mt-0.5 h-3 w-3 flex-shrink-0 text-emerald-600" />
                <span>{c}</span>
              </li>
            ))}
          </ul>
        </Card>
        <Card className="border-amber-500/40 bg-amber-500/10 p-4">
          <h3 className="mb-2 font-display text-[1.05rem] tracking-tight text-amber-800">
            <AlertTriangle className="mb-0.5 mr-1 inline h-4 w-4" />
            风险与提醒
          </h3>
          <ul className="space-y-1.5 text-[13px] leading-relaxed text-foreground/85">
            {tier.risks.map((r, i) => (
              <li key={i} className="flex items-start gap-1.5">
                <span
                  className="mt-1 h-1 w-1 flex-shrink-0 rounded-full bg-amber-700"
                  aria-hidden
                />
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* 平台搜索入口 */}
      <Card className="border-card-border/60 bg-card/60 p-4 sm:p-5">
        <h3 className="mb-3 font-display text-[1.1rem] tracking-tight">
          <ShoppingBag className="mb-0.5 mr-1 inline h-4 w-4 text-primary" />
          各平台搜索入口
        </h3>
        <div className="grid gap-2 sm:grid-cols-2">
          {PLATFORMS.map((p) => {
            const q = tier.picks[0]?.name ?? "外卖优惠";
            return (
              <a
                key={p.id}
                href={p.buildSearch(q)}
                target="_blank"
                rel="noopener noreferrer"
                data-testid={`takeout-platform-${p.id}`}
                title={`在 ${p.label} 搜索「${q}」` + (p.needsLogin ? " · 可能需登录" : "")}
                className="flex items-center justify-between gap-2 rounded-lg border border-primary/30 bg-primary/5 px-3 py-2.5 text-[13.5px] transition-colors hover-elevate active-elevate-2"
              >
                <span className="flex flex-col">
                  <span className="font-medium text-primary">{p.label}</span>
                  <span className="text-[11.5px] text-muted-foreground">
                    {p.hint}
                    {p.needsLogin && (
                      <Badge
                        variant="outline"
                        className="ml-1 rounded-full border-amber-500/40 px-1 py-0 text-[9.5px] text-amber-700"
                      >
                        需登录
                      </Badge>
                    )}
                  </span>
                </span>
                <ExternalLink className="h-4 w-4 flex-shrink-0 text-primary" />
              </a>
            );
          })}
        </div>
        <p className="mt-3 text-[11px] text-muted-foreground">
          仅跳到平台搜索页面，不抓取商户 / 实时数据。具体红包优惠以平台为准；如某平台 H5
          暂时受限，可改用百度站内搜索作兜底。
        </p>
      </Card>
    </section>
  );
}
