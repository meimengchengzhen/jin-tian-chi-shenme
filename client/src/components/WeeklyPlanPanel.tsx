// v2: 一周计划 / 预算计划面板。
// 用户输入：月/周预算 + 目标。输出：一周吃饭建议（鸡牛鱼/豆腐/外卖等次数）+ 估算每周花费 + 每天热量。
// 全部本地计算 + 经验规则；不查任何在线菜价。

import { useMemo, useState } from "react";
import { Wallet, Target, CalendarDays, Flame, Beef, ShoppingBag, Drumstick, Fish, Carrot, Egg, Sparkles, RefreshCw } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type Goal = "省钱" | "均衡" | "减脂" | "增肌" | "家庭";

const GOALS: { id: Goal; label: string; hint: string }[] = [
  { id: "省钱", label: "省钱", hint: "便宜+耐放食材，自炊为主" },
  { id: "均衡", label: "均衡", hint: "蔬菜蛋奶肉适当搭配" },
  { id: "减脂", label: "减脂", hint: "高蛋白+低热量，控制油盐糖" },
  { id: "增肌", label: "增肌", hint: "高蛋白多餐，主食碳水适度" },
  { id: "家庭", label: "家庭", hint: "大锅菜+素菜+汤，孩子长辈兼顾" },
];

interface PlanItem {
  name: string;
  count: number;
  costPerTime: number;
  caloriesPerServing: number;
  icon: React.ReactNode;
  note?: string;
}

interface PlanResult {
  items: PlanItem[];
  totalCost: number;
  totalSnacks: number;
  totalFruits: number;
  takeoutCount: number;
  takeoutCost: number;
  estDailyCal: number;
  tips: string[];
}

function buildPlan(weekly: number, goal: Goal): PlanResult {
  // 经验单位价：根据中国大陆超市/菜场常见水平（粗估，地区差异大，作引导）
  // 目标：21 餐 / 周 = 早 7 + 午 7 + 晚 7
  // 目标分配（一周内）：鸡 / 牛 / 鱼虾 / 豆腐蛋 / 蔬菜 / 主食 / 外卖 / 零食 / 水果

  let chicken = 3, beef = 1, fish = 1, tofuEgg = 4, veg = 7, takeout = 3, snackBudget = 30, fruitBudget = 60;

  if (goal === "省钱") {
    chicken = 2; beef = 0; fish = 0; tofuEgg = 7; takeout = 1; snackBudget = 15; fruitBudget = 40;
  } else if (goal === "均衡") {
    chicken = 3; beef = 1; fish = 2; tofuEgg = 4; takeout = 2; snackBudget = 25; fruitBudget = 60;
  } else if (goal === "减脂") {
    chicken = 4; beef = 1; fish = 2; tofuEgg = 4; takeout = 1; snackBudget = 15; fruitBudget = 80;
  } else if (goal === "增肌") {
    chicken = 4; beef = 2; fish = 2; tofuEgg = 5; takeout = 2; snackBudget = 50; fruitBudget = 60;
  } else if (goal === "家庭") {
    chicken = 3; beef = 1; fish = 2; tofuEgg = 5; takeout = 2; snackBudget = 30; fruitBudget = 80;
  }

  // 单价（人均，一份）
  const PRICE = {
    chicken: 12,
    beef: 20,
    fish: 18,
    tofuEgg: 6,
    veg: 5,
    takeout: 30,
  } as const;
  const CAL = {
    chicken: 480,
    beef: 580,
    fish: 420,
    tofuEgg: 320,
    veg: 240,
    takeout: 720,
  } as const;

  // 调度时长 — 周预算 < 200 触发降级；> 600 适当上调
  if (weekly < 200) {
    chicken = Math.max(1, chicken - 1);
    beef = 0;
    fish = Math.max(0, fish - 1);
    takeout = Math.max(0, takeout - 1);
    snackBudget = Math.min(snackBudget, 12);
    fruitBudget = Math.min(fruitBudget, 30);
  } else if (weekly > 600) {
    beef = Math.max(beef, 2);
    fish = Math.max(fish, 2);
    takeout = Math.max(takeout, 3);
  }

  const items: PlanItem[] = [
    { name: "鸡肉餐", count: chicken, costPerTime: PRICE.chicken, caloriesPerServing: CAL.chicken, icon: <Drumstick className="h-3.5 w-3.5 text-primary" />, note: "鸡腿/鸡胸/鸡翅 1 人份" },
    { name: "牛肉餐", count: beef, costPerTime: PRICE.beef, caloriesPerServing: CAL.beef, icon: <Beef className="h-3.5 w-3.5 text-primary" />, note: "黑椒牛柳 / 番茄牛腩 / 牛肉面" },
    { name: "鱼虾餐", count: fish, costPerTime: PRICE.fish, caloriesPerServing: CAL.fish, icon: <Fish className="h-3.5 w-3.5 text-primary" />, note: "清蒸鱼 / 油焖大虾 / 蛤蜊汤" },
    { name: "豆腐+蛋 餐", count: tofuEgg, costPerTime: PRICE.tofuEgg, caloriesPerServing: CAL.tofuEgg, icon: <Egg className="h-3.5 w-3.5 text-primary" />, note: "麻婆豆腐 / 番茄炒蛋 / 蒸蛋" },
    { name: "纯蔬菜餐", count: veg, costPerTime: PRICE.veg, caloriesPerServing: CAL.veg, icon: <Carrot className="h-3.5 w-3.5 text-primary" />, note: "炒青菜 / 凉拌 / 素菜汤" },
    { name: "外卖", count: takeout, costPerTime: PRICE.takeout, caloriesPerServing: CAL.takeout, icon: <ShoppingBag className="h-3.5 w-3.5 text-primary" />, note: "工作餐 / 偶尔奖励" },
  ];

  const cookedCost = items.reduce((s, x) => s + x.count * x.costPerTime, 0);
  const totalCost = cookedCost + snackBudget + fruitBudget;
  const totalCalories = items.reduce((s, x) => s + x.count * x.caloriesPerServing, 0);
  const estDailyCal = Math.round(totalCalories / 7 + 350); // 加上早餐/水果/零食的 daily 平均

  const tips: string[] = [];
  if (totalCost > weekly) {
    tips.push(`本计划估算花费 ¥${Math.round(totalCost)}，比一周预算多 ¥${Math.round(totalCost - weekly)} — 建议把外卖减到 1 次或换牛肉为鸡肉。`);
  } else {
    tips.push(`计划估算 ¥${Math.round(totalCost)} / 周，预算余 ¥${Math.round(weekly - totalCost)} 可以放零食或加餐。`);
  }
  if (goal === "减脂") tips.push("减脂周：每天吃 1 份高蛋白主菜，蔬菜多到撑，零食选无糖酸奶/鸡胸。");
  if (goal === "增肌") tips.push("增肌周：每天 4-5 顿，蛋白质 1.5g/kg 体重，主食按训练量调整。");
  if (goal === "省钱") tips.push("省钱周：豆腐+蛋是性价比最高的蛋白；鸡腿/带骨鸡 比鸡胸便宜。");
  if (goal === "家庭") tips.push("家庭周：每顿一荤一素一汤；周末做大菜剩菜中午带饭。");
  if (goal === "均衡") tips.push("均衡周：每天保证 1 份深色蔬菜 + 1 份蛋白；水果分到每天午后。");

  return {
    items,
    totalCost,
    totalSnacks: snackBudget,
    totalFruits: fruitBudget,
    takeoutCount: takeout,
    takeoutCost: takeout * PRICE.takeout,
    estDailyCal,
    tips,
  };
}

export function WeeklyPlanPanel() {
  const [monthly, setMonthly] = useState<number>(1500);
  const [goal, setGoal] = useState<Goal>("均衡");
  const [nonce, setNonce] = useState(0);
  const weekly = Math.round(monthly / 4.3);

  const plan = useMemo(() => buildPlan(weekly, goal), [weekly, goal, nonce]);

  return (
    <section className="mt-4 space-y-3" data-testid="weekly-plan">
      <header>
        <h2 className="font-display text-[1.4rem] tracking-tight">
          <CalendarDays className="mb-1 mr-1 inline h-5 w-5 text-primary" />
          一周吃饭计划 · 预算落地
        </h2>
        <p className="mt-1 text-[12.5px] text-muted-foreground">
          月预算默认 ¥1500（≈ 周 ¥{weekly}）· 可改成你的真实数字
        </p>
      </header>

      <Card className="grain border-card-border/60 bg-card/70 p-3 sm:p-4">
        <div className="space-y-2">
          <div>
            <p className="mb-1 text-[12px] font-medium text-foreground/80">
              <Wallet className="mb-0.5 mr-1 inline h-3.5 w-3.5 text-primary" />
              月预算（自炊+外卖+零食+水果）
            </p>
            <div className="flex flex-wrap items-center gap-1" data-testid="weekly-monthly">
              {[800, 1200, 1500, 2000, 2500, 3000].map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => setMonthly(b)}
                  className={`rounded-full border px-2.5 py-1 text-[12.5px] num transition-colors ${
                    monthly === b ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card/60 text-foreground/80 hover-elevate"
                  }`}
                  data-testid={`weekly-monthly-${b}`}
                >
                  ¥{b}
                </button>
              ))}
              <input
                type="number"
                min={300}
                max={20000}
                value={monthly}
                onChange={(e) => setMonthly(Number(e.target.value) || 1500)}
                className="w-24 rounded-full border border-border bg-card/60 px-2.5 py-1 text-[12.5px] num"
                aria-label="自定义月预算"
              />
              <span className="num text-[11.5px] text-muted-foreground">≈ ¥{weekly} / 周</span>
            </div>
          </div>

          <div>
            <p className="mb-1 text-[12px] font-medium text-foreground/80">
              <Target className="mb-0.5 mr-1 inline h-3.5 w-3.5 text-primary" />
              本周目标
            </p>
            <div className="flex flex-wrap gap-1" data-testid="weekly-goals">
              {GOALS.map((g) => {
                const a = goal === g.id;
                return (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setGoal(g.id)}
                    title={g.hint}
                    className={`rounded-full border px-2.5 py-1 text-[12.5px] transition-colors ${
                      a ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card/60 text-foreground/80 hover-elevate"
                    }`}
                    data-testid={`weekly-goal-${g.id}`}
                  >
                    {g.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <Button
          type="button"
          size="sm"
          className="mt-3 h-10 w-full gap-1 rounded-full"
          onClick={() => setNonce((n) => n + 1)}
          data-testid="weekly-rebuild"
        >
          <Sparkles className="h-4 w-4" />
          生成 / 重新生成本周计划
        </Button>
      </Card>

      <Card className="grain border-primary/40 bg-primary/5 p-3 sm:p-4" data-testid="weekly-result">
        <div className="flex items-baseline justify-between gap-2">
          <p className="text-[10.5px] font-medium uppercase tracking-[0.18em] text-primary/85">
            一周餐次估算 · 21 餐
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setNonce((n) => n + 1)}
            className="h-7 rounded-full text-[11.5px]"
            data-testid="weekly-refresh"
          >
            <RefreshCw className="mr-1 h-3.5 w-3.5" />
            再来一组
          </Button>
        </div>

        <ul className="mt-3 space-y-1.5">
          {plan.items.map((it) => (
            <li
              key={it.name}
              className="flex items-baseline gap-2 rounded-md border border-border/40 bg-background/50 px-2 py-1.5 text-[12.5px]"
              data-testid={`weekly-item-${it.name}`}
            >
              <span className="text-primary">{it.icon}</span>
              <div className="min-w-0 flex-1">
                <p>
                  <span className="font-medium">{it.name}</span>
                  <Badge variant="outline" className="ml-1 rounded-full px-1.5 py-0 text-[10.5px] num">
                    × {it.count} 次
                  </Badge>
                  {it.note && <span className="ml-1 text-[11px] text-muted-foreground">{it.note}</span>}
                </p>
                <p className="num text-[11px] text-muted-foreground">
                  ¥{it.count * it.costPerTime} · 约 {it.count * it.caloriesPerServing} kcal
                </p>
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-3 grid grid-cols-2 gap-2 text-[12px] sm:grid-cols-4">
          <Stat label="本周总估" icon={<Wallet />} value={`¥${Math.round(plan.totalCost)}`} sub={`/ 预算 ¥${weekly}`} />
          <Stat label="日平均热量" icon={<Flame />} value={`${plan.estDailyCal} kcal`} sub="含早+加餐" />
          <Stat label="零食 + 水果" icon={<ShoppingBag />} value={`¥${plan.totalSnacks + plan.totalFruits}`} sub="可灵活调" />
          <Stat label="外卖" icon={<ShoppingBag />} value={`${plan.takeoutCount} 次`} sub={`¥${plan.takeoutCost}`} />
        </div>

        <ul className="mt-3 list-disc space-y-1 pl-5 text-[12px] text-foreground/85">
          {plan.tips.map((t, i) => (
            <li key={i}>{t}</li>
          ))}
        </ul>

        <p className="mt-2 text-[10.5px] text-muted-foreground">
          一周计划是经验估算 · 中国大陆常见菜场超市单价 · 用作引导而非精确财务管理
        </p>
      </Card>
    </section>
  );
}

function Stat({ label, value, sub, icon }: { label: string; value: string; sub?: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-md border border-border/60 bg-background/60 px-2 py-1.5">
      <p className="inline-flex items-center gap-1 text-[10.5px] uppercase tracking-wider text-muted-foreground">
        <span className="h-3 w-3 text-primary">{icon}</span>
        {label}
      </p>
      <p className="num text-[15px] font-semibold">{value}</p>
      {sub && <p className="num text-[10.5px] text-muted-foreground">{sub}</p>}
    </div>
  );
}
