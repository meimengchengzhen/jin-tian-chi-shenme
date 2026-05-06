import { useMemo, useState } from "react";
import {
  Sparkles,
  Clock,
  ChefHat,
  RefreshCw,
  Lock,
  LockOpen,
  Copy,
  Check,
  ShoppingBasket,
  Users,
  Soup,
  Salad,
  Wheat,
  Github,
  Flame,
  Leaf,
  Info,
  AlertTriangle,
  ChevronRight,
} from "lucide-react";
import { DishDetail } from "@/components/DishDetail";
import { dishVisual } from "@/lib/dishVisual";
import { Wordmark, Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
  ALL_CUISINES,
  ALL_DIFFICULTIES,
  ALL_RESTRICTIONS,
  ALL_TASTES,
  RECIPES,
  type Recipe,
} from "@/data/recipes";
import {
  DEFAULT_PREFS,
  recommend,
  buildShoppingList,
  shoppingListToText,
  planToList,
  countByCourseUnderHardOnly,
  type MealPlan,
  type Preferences,
} from "@/lib/recommend";

// === 小工具组件 ===
function Chip({
  active,
  onClick,
  children,
  testId,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  testId?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-testid={testId}
      className={`inline-flex h-9 items-center rounded-full border px-3.5 text-[13px] font-medium transition-colors hover-elevate active-elevate-2 ${
        active
          ? "border-primary/50 bg-primary text-primary-foreground"
          : "border-border bg-card/60 text-foreground/80"
      }`}
    >
      {children}
    </button>
  );
}

function SectionTitle({
  num,
  title,
  hint,
}: {
  num: string;
  title: string;
  hint?: string;
}) {
  return (
    <div className="mb-3 flex items-baseline gap-2">
      <span className="font-display text-[15px] text-primary num">{num}</span>
      <h3 className="text-[15px] font-semibold tracking-tight">{title}</h3>
      {hint && <span className="ml-auto text-xs text-muted-foreground">{hint}</span>}
    </div>
  );
}

function CourseIcon({ course, className }: { course: string; className?: string }) {
  if (course === "main") return <ChefHat className={className} aria-hidden />;
  if (course === "soup") return <Soup className={className} aria-hidden />;
  if (course === "veggie") return <Salad className={className} aria-hidden />;
  return <Wheat className={className} aria-hidden />;
}

const COURSE_LABEL: Record<string, string> = {
  main: "主菜",
  veggie: "素菜",
  soup: "汤",
  staple: "主食",
};

function DifficultyDots({ d }: { d: "简单" | "中等" | "进阶" }) {
  const n = d === "简单" ? 1 : d === "中等" ? 2 : 3;
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`难度 ${d}`}>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className={`h-1.5 w-1.5 rounded-full ${
            i < n ? "bg-primary" : "bg-muted-foreground/25"
          }`}
        />
      ))}
    </span>
  );
}

// === 菜品卡片 ===
function DishCard({
  recipe,
  locked,
  onToggleLock,
  onSwap,
  onOpenDetail,
}: {
  recipe: Recipe;
  locked: boolean;
  onToggleLock: () => void;
  onSwap: () => void;
  onOpenDetail: () => void;
}) {
  const visual = dishVisual(recipe.name, recipe.course, recipe.cuisine);
  return (
    <Card className="grain animate-rise relative overflow-hidden border-card-border/60 bg-card/80 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenDetail}
            data-testid={`thumb-recipe-${recipe.id}`}
            aria-label={`查看 ${recipe.name} 详情`}
            className="relative flex h-14 w-14 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl text-3xl shadow-sm transition-transform hover:scale-[1.04] active:scale-[0.98]"
            style={{
              background: `linear-gradient(135deg, ${visual.gradient[0]}, ${visual.gradient[1]})`,
            }}
          >
            <span aria-hidden className="drop-shadow-sm">{visual.emoji}</span>
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 rounded-xl"
              style={{
                background:
                  "radial-gradient(circle at 30% 25%, rgba(255,255,255,0.45), transparent 55%)",
              }}
            />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-display text-[1.15rem] tracking-tight" data-testid={`text-recipe-${recipe.id}`}>
                {recipe.name}
              </h4>
              <Badge variant="outline" className="rounded-full px-2 py-0 text-[10px]">
                <CourseIcon course={recipe.course} className="mr-1 h-2.5 w-2.5" />
                {COURSE_LABEL[recipe.course]}
              </Badge>
            </div>
            <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1 num">
                <Clock className="h-3 w-3" /> 约 {recipe.timeMinutes} 分钟
              </span>
              <span className="inline-flex items-center gap-1">
                <DifficultyDots d={recipe.difficulty} /> {recipe.difficulty}
              </span>
              <span className="hidden sm:inline">{recipe.cuisine}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            size="icon"
            variant="ghost"
            onClick={onToggleLock}
            data-testid={`button-lock-${recipe.id}`}
            aria-label={locked ? "解锁这道菜" : "锁定这道菜"}
            className="h-8 w-8"
          >
            {locked ? (
              <Lock className="h-4 w-4 text-primary" />
            ) : (
              <LockOpen className="h-4 w-4" />
            )}
          </Button>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            onClick={onSwap}
            data-testid={`button-swap-${recipe.id}`}
            aria-label="只换这一道"
            className="h-8 w-8"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <p className="mt-3 text-[13.5px] leading-relaxed text-foreground/80">
        <Sparkles className="mr-1 inline h-3.5 w-3.5 text-primary/80" />
        {recipe.reason}
      </p>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {recipe.tastes.map((t) => (
          <Badge
            key={t}
            variant="secondary"
            className="rounded-full bg-accent/60 px-2 py-0 text-[11px] text-accent-foreground"
          >
            {(t === "麻辣" || t === "重辣" || t === "微辣") && (
              <Flame className="mr-0.5 h-2.5 w-2.5" />
            )}
            {t === "清淡" && <Leaf className="mr-0.5 h-2.5 w-2.5" />}
            {t}
          </Badge>
        ))}
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={onOpenDetail}
        data-testid={`button-detail-${recipe.id}`}
        className="mt-3 h-9 w-full justify-between rounded-full border-primary/30 bg-primary/5 text-[13px] text-primary hover:bg-primary/10"
      >
        <span className="inline-flex items-center gap-1.5">
          <Info className="h-3.5 w-3.5" />
          查看详情 · 食材热量 / 价格 / 视频
        </span>
        <ChevronRight className="h-4 w-4" />
      </Button>
    </Card>
  );
}

// === 主页 ===
export default function Home() {
  const { toast } = useToast();
  const [prefs, setPrefs] = useState<Preferences>(DEFAULT_PREFS);
  const [plan, setPlan] = useState<MealPlan | null>(null);
  const [lockedIds, setLockedIds] = useState<Set<string>>(new Set());
  const [shaking, setShaking] = useState(false);
  const [copied, setCopied] = useState(false);
  const [detailRecipe, setDetailRecipe] = useState<Recipe | null>(null);

  // 当前锁定菜品（从 plan 中筛出）
  const lockedRecipes = useMemo(() => {
    if (!plan) return [];
    return planToList(plan).filter((r) => lockedIds.has(r.id));
  }, [plan, lockedIds]);

  function rollAll() {
    setShaking(true);
    setTimeout(() => {
      setPlan(recommend(prefs, lockedRecipes));
      setShaking(false);
    }, 280);
  }

  function swapOne(recipe: Recipe) {
    if (!plan) return;
    // 从锁定列表中临时移除该菜，然后重新推荐：之前所有锁定（包括其它菜）继续保持
    const keepLocked = lockedRecipes.filter((r) => r.id !== recipe.id);
    // 临时排除当前的菜避免再次出现
    const tempPrefs: Preferences = { ...prefs };
    let attempts = 0;
    let next: MealPlan = recommend(tempPrefs, keepLocked);
    while (planToList(next).some((r) => r.id === recipe.id) && attempts < 6) {
      next = recommend(tempPrefs, keepLocked);
      attempts++;
    }
    setPlan(next);
    // 锁定 ID 中如果含被换掉那道，移除
    if (lockedIds.has(recipe.id)) {
      const ns = new Set(lockedIds);
      ns.delete(recipe.id);
      setLockedIds(ns);
    }
  }

  function toggleLock(id: string) {
    const ns = new Set(lockedIds);
    if (ns.has(id)) ns.delete(id);
    else ns.add(id);
    setLockedIds(ns);
  }

  async function copyShoppingList() {
    if (!plan) return;
    try {
      await navigator.clipboard.writeText(shoppingListToText(plan));
      setCopied(true);
      toast({ title: "买菜清单已复制", description: "可以粘贴到微信、备忘录或打印出来。" });
      setTimeout(() => setCopied(false), 1800);
    } catch {
      toast({ title: "复制失败", description: "请长按选择文字手动复制。", variant: "destructive" });
    }
  }

  const togglePref = <K extends "tastes" | "restrictions" | "cuisines" | "difficulties">(
    key: K,
    value: Preferences[K][number],
  ) => {
    setPrefs((p) => {
      const set = new Set(p[key] as readonly string[]);
      if (set.has(value as string)) set.delete(value as string);
      else set.add(value as string);
      return { ...p, [key]: Array.from(set) as Preferences[K] };
    });
  };

  const shoppingList = plan ? buildShoppingList(plan) : null;
  const totalIngredients = shoppingList
    ? shoppingList["蔬菜"].length +
      shoppingList["肉蛋豆制品"].length +
      shoppingList["调味/主食"].length
    : 0;

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3 sm:px-6">
          <Wordmark />
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-card/60 px-3 py-1.5 text-xs text-muted-foreground hover-elevate active-elevate-2"
            data-testid="link-github"
          >
            <Github className="h-3.5 w-3.5" /> GitHub
          </a>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl px-4 sm:px-6">
        {/* Hero */}
        <section className="pt-8 sm:pt-12">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-primary/80">
            <span className="h-px w-8 bg-primary/40" /> 家常菜随机器 · MVP
          </div>
          <h1 className="mt-4 font-display text-[2.1rem] leading-[1.08] tracking-tight sm:text-[2.6rem]">
            晚饭就吃这些。
            <br />
            <span className="text-primary">不用再想了。</span>
          </h1>
          <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-muted-foreground">
            告诉我们今天几个人吃、有多少时间、忌口偏好，
            我们帮你随机搭一桌家常菜，并按蔬菜 / 肉蛋 / 调味分类生成买菜清单。
            不用登录，刷新即换。
          </p>
        </section>

        {/* 偏好表单 */}
        <section className="mt-8">
          <Card className="grain border-card-border/60 bg-card/70 p-5 sm:p-6">
            {/* 人数 */}
            <div className="mb-5">
              <div className="mb-2 flex items-center justify-between">
                <Label className="flex items-center gap-1.5 text-sm font-medium">
                  <Users className="h-4 w-4 text-primary" /> 几个人吃
                </Label>
                <span className="font-display text-lg num text-primary" data-testid="text-servings">
                  {prefs.servings} 人
                </span>
              </div>
              <Slider
                value={[prefs.servings]}
                min={1}
                max={8}
                step={1}
                onValueChange={(v) => setPrefs((p) => ({ ...p, servings: v[0] }))}
                data-testid="slider-servings"
              />
            </div>

            {/* 用时 */}
            <div className="mb-5">
              <div className="mb-2 flex items-center justify-between">
                <Label className="flex items-center gap-1.5 text-sm font-medium">
                  <Clock className="h-4 w-4 text-primary" /> 最长能花多少时间
                </Label>
                <span className="font-display text-lg num text-primary" data-testid="text-time">
                  {prefs.maxTimeMinutes} 分钟
                </span>
              </div>
              <Slider
                value={[prefs.maxTimeMinutes]}
                min={15}
                max={120}
                step={5}
                onValueChange={(v) => setPrefs((p) => ({ ...p, maxTimeMinutes: v[0] }))}
                data-testid="slider-time"
              />
              <div className="mt-1 flex justify-between text-[10.5px] text-muted-foreground num">
                <span>15 分钟快手</span>
                <span>2 小时慢炖</span>
              </div>
            </div>

            {/* 配置主菜 + 汤 + 素菜 */}
            <div className="mb-5 flex flex-col gap-3 rounded-lg border border-border/60 bg-background/50 p-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <Label className="text-sm font-medium">主菜数量</Label>
                <div className="flex gap-1">
                  {[1, 2, 3].map((n) => (
                    <Chip
                      key={n}
                      active={prefs.mainCount === n}
                      onClick={() => setPrefs((p) => ({ ...p, mainCount: n }))}
                      testId={`chip-main-${n}`}
                    >
                      {n}
                    </Chip>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <label className="inline-flex cursor-pointer items-center gap-2">
                  <Switch
                    checked={prefs.withVeggie}
                    onCheckedChange={(c) => setPrefs((p) => ({ ...p, withVeggie: c }))}
                    data-testid="switch-veggie"
                  />
                  <span className="inline-flex items-center gap-1">
                    <Salad className="h-3.5 w-3.5" /> 配素菜
                  </span>
                </label>
                <label className="inline-flex cursor-pointer items-center gap-2">
                  <Switch
                    checked={prefs.withSoup}
                    onCheckedChange={(c) => setPrefs((p) => ({ ...p, withSoup: c }))}
                    data-testid="switch-soup"
                  />
                  <span className="inline-flex items-center gap-1">
                    <Soup className="h-3.5 w-3.5" /> 配汤
                  </span>
                </label>
              </div>
            </div>

            <Separator className="my-5" />

            <SectionTitle num="01" title="口味偏好" hint="可多选 / 留空不限" />
            <div className="flex flex-wrap gap-2">
              {ALL_TASTES.map((t) => (
                <Chip
                  key={t}
                  active={prefs.tastes.includes(t)}
                  onClick={() => togglePref("tastes", t)}
                  testId={`chip-taste-${t}`}
                >
                  {t}
                </Chip>
              ))}
            </div>

            <div className="mt-5">
              <SectionTitle num="02" title="忌口 / 饮食限制" hint="勾选避开" />
              <div className="flex flex-wrap gap-2">
                {ALL_RESTRICTIONS.map((r) => (
                  <Chip
                    key={r}
                    active={prefs.restrictions.includes(r)}
                    onClick={() => togglePref("restrictions", r)}
                    testId={`chip-restriction-${r}`}
                  >
                    {r}
                  </Chip>
                ))}
              </div>
            </div>

            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <div>
                <SectionTitle num="03" title="菜系" />
                <div className="flex flex-wrap gap-2">
                  {ALL_CUISINES.map((c) => (
                    <Chip
                      key={c}
                      active={prefs.cuisines.includes(c)}
                      onClick={() => togglePref("cuisines", c)}
                      testId={`chip-cuisine-${c}`}
                    >
                      {c}
                    </Chip>
                  ))}
                </div>
              </div>
              <div>
                <SectionTitle num="04" title="难度" />
                <div className="flex flex-wrap gap-2">
                  {ALL_DIFFICULTIES.map((d) => (
                    <Chip
                      key={d}
                      active={prefs.difficulties.includes(d)}
                      onClick={() => togglePref("difficulties", d)}
                      testId={`chip-difficulty-${d}`}
                    >
                      {d}
                    </Chip>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* CTA */}
          <div className="mt-5 flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
            <Button
              size="lg"
              className="group h-14 flex-1 gap-2 rounded-full text-[15px] font-semibold shadow-lg shadow-primary/20"
              onClick={rollAll}
              data-testid="button-roll"
            >
              <span className={`inline-flex ${shaking ? "animate-wiggle" : ""}`}>
                <Sparkles className="h-5 w-5" />
              </span>
              {plan ? "换一组试试" : "今天吃什么 →"}
            </Button>
            {plan && (
              <Button
                variant="outline"
                size="lg"
                className="h-14 rounded-full"
                onClick={() => {
                  setPlan(null);
                  setLockedIds(new Set());
                }}
                data-testid="button-reset"
              >
                重置
              </Button>
            )}
          </div>
          {plan && lockedIds.size > 0 && (
            <p className="mt-3 text-center text-xs text-muted-foreground">
              已锁定 {lockedIds.size} 道菜，下一次随机会保留
            </p>
          )}
        </section>

        {/* 结果 */}
        {plan && (
          <section className="mt-10">
            <div className="mb-4 flex items-baseline justify-between">
              <h2 className="font-display text-[1.4rem] tracking-tight">今晚就吃这些</h2>
              <span className="text-xs text-muted-foreground">
                共 {planToList(plan).length} 道 · {prefs.servings} 人份
              </span>
            </div>

            {/* 兜底：放宽提示 */}
            {plan.relaxedNotes && plan.relaxedNotes.length > 0 && planToList(plan).length > 0 && (
              <div
                className="mb-3 flex items-start gap-2 rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 text-[12.5px] text-foreground/80"
                data-testid="banner-relaxed"
              >
                <Info className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-primary" />
                <span>
                  当前筛选有点严格，已自动放宽：
                  <span className="font-medium text-primary">
                    {plan.relaxedNotes.join(" · ")}
                  </span>
                  。忌口和饮食禁忌仍然完全遵守。
                </span>
              </div>
            )}

            {/* 兜底：仍无结果 */}
            {planToList(plan).length === 0 && (
              <div
                className="mb-3 flex items-start gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-3 text-[13px] text-foreground/85"
                data-testid="banner-no-result"
              >
                <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-500" />
                <div>
                  <div className="font-medium">没有匹配到任何菜</div>
                  <div className="mt-1 text-[12px] text-muted-foreground">
                    {(() => {
                      const hint = buildEmptyHint(prefs);
                      return hint;
                    })()}
                  </div>
                </div>
              </div>
            )}

            {/* 兜底：未填满的 course */}
            {plan.unmetCourses && plan.unmetCourses.length > 0 && planToList(plan).length > 0 && (
              <div
                className="mb-3 flex items-start gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-[12.5px] text-foreground/80"
                data-testid="banner-partial"
              >
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-amber-500" />
                <span>
                  以下分类暂无符合忌口的菜：
                  <span className="font-medium">
                    {plan.unmetCourses
                      .map((c) => COURSE_LABEL[c] ?? c)
                      .join(" · ")}
                  </span>
                  。可以试试关闭对应开关或减少忌口。
                </span>
              </div>
            )}

            <div className="grid gap-3">
              {plan.mains.map((r) => (
                <DishCard
                  key={r.id}
                  recipe={r}
                  locked={lockedIds.has(r.id)}
                  onToggleLock={() => toggleLock(r.id)}
                  onSwap={() => swapOne(r)}
                  onOpenDetail={() => setDetailRecipe(r)}
                />
              ))}
              {plan.veggie && (
                <DishCard
                  recipe={plan.veggie}
                  locked={lockedIds.has(plan.veggie.id)}
                  onToggleLock={() => toggleLock(plan.veggie!.id)}
                  onSwap={() => swapOne(plan.veggie!)}
                  onOpenDetail={() => setDetailRecipe(plan.veggie!)}
                />
              )}
              {plan.soup && (
                <DishCard
                  recipe={plan.soup}
                  locked={lockedIds.has(plan.soup.id)}
                  onToggleLock={() => toggleLock(plan.soup!.id)}
                  onSwap={() => swapOne(plan.soup!)}
                  onOpenDetail={() => setDetailRecipe(plan.soup!)}
                />
              )}
            </div>

            {/* 买菜清单 */}
            {shoppingList && planToList(plan).length > 0 && (
              <div className="mt-8">
                <Card className="grain border-card-border/60 bg-card/80 p-5 sm:p-6">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                          <ShoppingBasket className="h-4 w-4" />
                        </span>
                        <h3 className="font-display text-[1.25rem] tracking-tight">
                          今日买菜清单
                        </h3>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground num">
                        共 {totalIngredients} 项 · 已按品类整理
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={copyShoppingList}
                      className="rounded-full"
                      data-testid="button-copy-list"
                    >
                      {copied ? (
                        <>
                          <Check className="mr-1 h-3.5 w-3.5 text-primary" /> 已复制
                        </>
                      ) : (
                        <>
                          <Copy className="mr-1 h-3.5 w-3.5" /> 复制清单
                        </>
                      )}
                    </Button>
                  </div>

                  <div className="mt-5 grid gap-5 sm:grid-cols-3">
                    {(["蔬菜", "肉蛋豆制品", "调味/主食"] as const).map((cat) => {
                      const items = shoppingList[cat];
                      const tone =
                        cat === "蔬菜"
                          ? "text-[#6B8E3D]"
                          : cat === "肉蛋豆制品"
                          ? "text-primary"
                          : "text-[#8A6B2B]";
                      return (
                        <div key={cat}>
                          <div className="mb-2 flex items-baseline justify-between">
                            <h4 className={`text-[12px] font-semibold uppercase tracking-wider ${tone}`}>
                              {cat}
                            </h4>
                            <span className="text-[10.5px] text-muted-foreground num">
                              {items.length}
                            </span>
                          </div>
                          {items.length === 0 ? (
                            <p className="text-xs text-muted-foreground">— 无 —</p>
                          ) : (
                            <ul className="space-y-1.5">
                              {items.map((it) => (
                                <li
                                  key={it.name}
                                  className="flex items-baseline justify-between gap-2 border-b border-dashed border-border/60 pb-1.5 last:border-0"
                                  data-testid={`item-${it.name}`}
                                >
                                  <span className="text-[13.5px]">{it.name}</span>
                                  <span className="text-[11.5px] text-muted-foreground num">
                                    {it.qty.join(" / ")}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </Card>
              </div>
            )}
          </section>
        )}

        {/* GitHub / 开源 路线 */}
        <section className="mt-16 border-t border-border/60 pt-10">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            <Github className="h-3.5 w-3.5" /> open-source roadmap
          </div>
          <h2 className="mt-3 font-display text-[1.6rem] tracking-tight">
            适合作为开源 MVP 的方向
          </h2>
          <p className="mt-2 text-[14px] text-muted-foreground">
            这是一个原型。如果你想 fork，下面是建议的模块化拓展方向。
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {[
              {
                t: "菜谱数据层",
                d: "把 client/src/data/recipes.ts 抽成独立 JSON / YAML，社区 PR 即可贡献菜谱；增加图片字段。",
              },
              {
                t: "推荐算法",
                d: "lib/recommend.ts 可替换：当前是「过滤 + 评分 + 随机扰动」，可接入用户历史偏好或本地小模型。",
              },
              {
                t: "买菜清单导出",
                d: "复制文本已就绪，可加导出为微信小程序卡片 / Markdown / 打印模板。",
              },
              {
                t: "本地化数据",
                d: "把买菜单位适配到「斤 / 把 / 克」混排，按地区菜场习惯切换。",
              },
              {
                t: "营养与预算",
                d: "为每道菜补充能量、蛋白质和大致价格，扩展过滤条件。",
              },
              {
                t: "PWA & 离线",
                d: "缓存数据 + 添加到主屏，让做饭中途也能查步骤。",
              },
            ].map((card) => (
              <Card
                key={card.t}
                className="border-card-border/60 bg-card/60 p-4 hover-elevate active-elevate-2"
              >
                <h3 className="font-display text-[15px] tracking-tight">{card.t}</h3>
                <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
                  {card.d}
                </p>
              </Card>
            ))}
          </div>
        </section>

        <footer className="mt-16 flex flex-col items-center gap-2 pb-8 text-center text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5 text-primary/80">
            <Logo size={20} /> 今天吃什么
          </span>
          <span>
            原型作品 · 内置 {planLengthLabel()} 道示例菜谱 · 不收集任何数据
          </span>
        </footer>
      </main>

      <DishDetail
        recipe={detailRecipe}
        servings={prefs.servings}
        onClose={() => setDetailRecipe(null)}
      />
    </div>
  );
}

function planLengthLabel() {
  return String(RECIPES.length);
}

// 当推荐结果为空时，给用户讲清楚是「忌口太严格」还是「软性条件太严格」。
function buildEmptyHint(prefs: Preferences): string {
  const hardCounts = countByCourseUnderHardOnly(prefs);
  const reasons: string[] = [];
  const want: { key: "main" | "veggie" | "soup"; label: string; need: boolean }[] = [
    { key: "main", label: "主菜", need: prefs.mainCount > 0 },
    { key: "veggie", label: "素菜", need: prefs.withVeggie },
    { key: "soup", label: "汤", need: prefs.withSoup },
  ];
  const blockedByRestrictions = want
    .filter((w) => w.need && hardCounts[w.key] === 0)
    .map((w) => w.label);

  if (blockedByRestrictions.length > 0) {
    reasons.push(
      `当前忌口（${prefs.restrictions.join(" · ")}）已经把所有「${blockedByRestrictions.join(
        " · ",
      )}」类菜都筛掉了，建议减少忌口或关闭对应开关。`,
    );
  } else {
    // 软性条件已经全部放宽，仍然 0 道，说明忌口组合本身就极严格
    reasons.push(
      `你的忌口组合在 ${RECIPES.length} 道示例菜里没有完全匹配的菜。可以尝试关闭「配素菜 / 配汤」或减少忌口标签。`,
    );
  }
  return reasons.join(" ");
}
