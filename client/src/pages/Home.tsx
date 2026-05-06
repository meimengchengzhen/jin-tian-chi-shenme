import { useEffect, useMemo, useState } from "react";
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
  UserCircle2,
  Cloud,
  CalendarDays,
  Heart,
  History as HistoryIcon,
  CheckCircle2,
  Repeat,
} from "lucide-react";
import { DishDetail } from "@/components/DishDetail";
import { ProfileDialog } from "@/components/ProfileDialog";
import { Onboarding } from "@/components/Onboarding";
import { DishImage } from "@/components/DishImage";
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
  calorieSummary,
  type MealPlan,
  type Preferences,
  type RecommendContext,
} from "@/lib/recommend";
import { perPersonCaloriesOf } from "@/lib/calories";
import {
  getActiveProfile,
  computePlan,
  SLOT_LABELS,
  type Profile,
  type MealSlot,
} from "@/lib/profile";
import {
  loadEnv,
  saveEnv as persistEnv,
  resolveEnv,
  type EnvContext,
} from "@/lib/environment";
import {
  SCENARIOS,
  applyScenarioToPrefs,
  loadScenario,
  saveScenario,
  hasOnboarded,
  markOnboarded,
  getScenario,
  type ScenarioId,
} from "@/lib/scenarios";
import {
  loadFavorites,
  loadHistory,
  loadNoRepeat,
  recentRecipeIds,
  saveHistoryEntry,
  saveNoRepeat,
  toggleFavorite,
  type HistoryEntry,
} from "@/lib/history";
import { applyMealTheme, MEAL_THEMES } from "@/lib/mealTheme";
import { CompanionPanel } from "@/components/CompanionPanel";
import type { CompanionContext } from "@/lib/companionRecommend";

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
  favorite,
  onToggleLock,
  onSwap,
  onOpenDetail,
  onToggleFavorite,
  targetMealCal,
}: {
  recipe: Recipe;
  locked: boolean;
  favorite: boolean;
  onToggleLock: () => void;
  onSwap: () => void;
  onOpenDetail: () => void;
  onToggleFavorite: () => void;
  /** 当前餐次目标人均热量，启用饮食计划时显示对比 */
  targetMealCal?: number;
}) {
  const visual = dishVisual(recipe.name, recipe.course, recipe.cuisine);
  const perPerson = targetMealCal ? perPersonCaloriesOf(recipe) : 0;
  return (
    <Card className="grain animate-rise relative overflow-hidden border-card-border/60 bg-card/80 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenDetail}
            data-testid={`thumb-recipe-${recipe.id}`}
            aria-label={`查看 ${recipe.name} 详情`}
            className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl shadow-sm transition-transform hover:scale-[1.04] active:scale-[0.98]"
          >
            <DishImage visual={visual} alt={`${recipe.name} 示意图`} className="h-full w-full" />
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
            onClick={onToggleFavorite}
            data-testid={`button-fav-${recipe.id}`}
            aria-label={favorite ? "取消收藏" : "收藏这道菜"}
            className="h-8 w-8"
          >
            <Heart
              className={`h-4 w-4 ${favorite ? "fill-rose-500 text-rose-500" : ""}`}
            />
          </Button>
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

      {targetMealCal && perPerson > 0 && (
        <div
          className="mt-2 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-2.5 py-1 text-[11.5px] text-primary num"
          data-testid={`chip-calorie-${recipe.id}`}
        >
          <Flame className="h-3 w-3" />
          人均 {perPerson} kcal · 餐次目标 {targetMealCal} kcal
        </div>
      )}

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
          查看详情 · 食材 / 视频 / 抖音 / 百度
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

  // 档案与环境
  const [profile, setProfile] = useState<Profile | null>(() => getActiveProfile());
  const [env, setEnv] = useState<EnvContext>(() => loadEnv());
  const [profileOpen, setProfileOpen] = useState(false);

  // 场景 / 引导
  const [scenarioId, setScenarioId] = useState<ScenarioId>(() => loadScenario());
  const [onboardingOpen, setOnboardingOpen] = useState<boolean>(() => !hasOnboarded());

  // 收藏 / 历史 / 不吃重复
  const [favorites, setFavorites] = useState<Set<string>>(() => loadFavorites());
  const [history, setHistory] = useState<HistoryEntry[]>(() => loadHistory());
  const [noRepeat, setNoRepeat] = useState<boolean>(() => loadNoRepeat());

  // 应用场景预设到 prefs（Onboarding 选完 / 用户切 Tab 时）
  function applyScenario(id: ScenarioId, opts?: { silent?: boolean }) {
    setScenarioId(id);
    saveScenario(id);
    setPrefs((p) => applyScenarioToPrefs(p, id));
    if (!opts?.silent) {
      toast({
        title: `已切换到「${getScenario(id).label}」`,
        description: "默认人数 / 餐次 / 难度已按场景调整。",
      });
    }
  }

  // 餐次主题：跟随 profile.slot
  const currentSlot: MealSlot = profile?.slot ?? getScenario(scenarioId).defaultSlot;
  useEffect(() => {
    applyMealTheme(currentSlot);
  }, [currentSlot]);

  // 用户档案的忌口自动并入 prefs.restrictions（不影响 prefs 的其它字段）
  useEffect(() => {
    if (profile?.flavor.restrictions && profile.flavor.restrictions.length > 0) {
      setPrefs((p) => {
        const merged = Array.from(new Set([...p.restrictions, ...profile.flavor.restrictions]));
        if (merged.length === p.restrictions.length) return p;
        return { ...p, restrictions: merged };
      });
    }
  }, [profile]);

  // 进入页面应用一次场景预设（首次 / 旧用户）
  useEffect(() => {
    setPrefs((p) => applyScenarioToPrefs(p, scenarioId));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function refreshProfile() {
    setProfile(getActiveProfile());
  }

  function applyEnv(next: EnvContext) {
    setEnv(next);
    persistEnv(next);
  }

  // 推荐上下文
  const recommendCtx: RecommendContext = useMemo(() => {
    const ctx: RecommendContext = {};
    if (profile) {
      ctx.flavor = profile.flavor;
      ctx.slot = profile.slot;
      if (profile.planEnabled && profile.body) {
        const planResult = computePlan(profile.body, profile.slot);
        ctx.targetMealCalories = planResult.mealCalories;
      }
    }
    ctx.env = resolveEnv(env);
    ctx.scenario = getScenario(scenarioId);
    if (!ctx.slot) ctx.slot = ctx.scenario.defaultSlot;
    ctx.favorites = favorites;
    ctx.recentIds = recentRecipeIds(7);
    ctx.noRepeat = noRepeat;
    return ctx;
  }, [profile, env, scenarioId, favorites, history, noRepeat]);

  // 当前锁定菜品
  const lockedRecipes = useMemo(() => {
    if (!plan) return [];
    return planToList(plan).filter((r) => lockedIds.has(r.id));
  }, [plan, lockedIds]);

  function rollAll() {
    setShaking(true);
    setTimeout(() => {
      setPlan(recommend(prefs, lockedRecipes, recommendCtx));
      setShaking(false);
    }, 280);
  }

  function swapOne(recipe: Recipe) {
    if (!plan) return;
    const keepLocked = lockedRecipes.filter((r) => r.id !== recipe.id);
    const tempPrefs: Preferences = { ...prefs };
    let attempts = 0;
    let next: MealPlan = recommend(tempPrefs, keepLocked, recommendCtx);
    while (planToList(next).some((r) => r.id === recipe.id) && attempts < 6) {
      next = recommend(tempPrefs, keepLocked, recommendCtx);
      attempts++;
    }
    setPlan(next);
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

  function onToggleFavorite(id: string) {
    toggleFavorite(id);
    setFavorites(loadFavorites());
  }

  function refreshFavorites() {
    setFavorites(loadFavorites());
  }

  function onSelectThis() {
    if (!plan) return;
    const list = planToList(plan);
    if (list.length === 0) return;
    const entry: HistoryEntry = {
      ts: Date.now(),
      recipeIds: list.map((r) => r.id),
      names: list.map((r) => r.name),
      slot: SLOT_LABELS[currentSlot],
      scenario: getScenario(scenarioId).label,
    };
    saveHistoryEntry(entry);
    setHistory(loadHistory());
    toast({
      title: "已记下今天就吃这些 ✓",
      description: list.map((r) => r.name).join(" · "),
    });
  }

  function onToggleNoRepeat(v: boolean) {
    setNoRepeat(v);
    saveNoRepeat(v);
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

  const calSummary = plan && recommendCtx.targetMealCalories
    ? calorieSummary(plan, recommendCtx.targetMealCalories)
    : null;

  // 控卡 / 增肌场景下，若没启用饮食计划：在结果区显眼引导用户去开启。
  const calorieScenario = scenarioId === "personal-cut" || scenarioId === "fitness-bulk";
  const calorieHintNeeded =
    calorieScenario && !recommendCtx.targetMealCalories;

  const meal = MEAL_THEMES[currentSlot];

  const companionCtx: CompanionContext = useMemo(
    () => ({
      scenarioId,
      servings: prefs.servings,
      slot: currentSlot,
      sex: profile?.body?.sex,
      age: profile?.body?.age,
      hasKids: scenarioId === "kid-friendly",
      elderHeavy: scenarioId === "elder-light",
      maxTimeMinutes: prefs.maxTimeMinutes,
    }),
    [scenarioId, prefs.servings, currentSlot, profile?.body?.sex, profile?.body?.age, prefs.maxTimeMinutes],
  );

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-2 px-4 py-3 sm:px-6">
          <Wordmark />
          <div className="flex items-center gap-2">
            <span
              className="hidden items-center gap-1 rounded-full border border-border/70 bg-card/60 px-3 py-1.5 text-[11px] text-muted-foreground sm:inline-flex"
              data-testid="badge-meal-theme"
              title={meal.description}
            >
              {meal.emoji} {meal.label}
            </span>
            <button
              type="button"
              onClick={() => setProfileOpen(true)}
              data-testid="button-open-profile"
              className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-card/60 px-3 py-1.5 text-xs text-foreground/85 hover-elevate active-elevate-2"
            >
              <UserCircle2 className="h-3.5 w-3.5 text-primary" />
              {profile ? <span className="max-w-[7em] truncate">{profile.nickname}</span> : "登录 / 档案"}
            </button>
            <a
              href="https://github.com/meimengchengzhen/jin-tian-chi-shenme"
              target="_blank"
              rel="noreferrer"
              className="hidden items-center gap-1.5 rounded-full border border-border/70 bg-card/60 px-3 py-1.5 text-xs text-muted-foreground hover-elevate active-elevate-2 sm:inline-flex"
              data-testid="link-github"
            >
              <Github className="h-3.5 w-3.5" /> GitHub
            </a>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl px-4 sm:px-6">
        {/* Hero */}
        <section className="pt-8 sm:pt-12">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-primary/80">
            <span className="h-px w-8 bg-primary/40" /> {meal.label} · {meal.toneHint}
          </div>
          <h1 className="mt-4 font-display text-[2.1rem] leading-[1.08] tracking-tight sm:text-[2.6rem]">
            {meal.label}就吃这些。
            <br />
            <span className="text-primary">不用再想了。</span>
          </h1>
          <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-muted-foreground">
            告诉我们今天几个人吃、有多少时间、忌口偏好，
            我们帮你随机搭一桌家常菜，并按蔬菜 / 肉蛋 / 调味分类生成买菜清单。
            可以创建本地档案保存喜好与饮食目标，所有数据都只保存在你的浏览器里。
          </p>
        </section>

        {/* 场景 Tabs：移动端 2 列网格（一眼可见），桌面端水平 wrap */}
        <section className="mt-7">
          <div className="mb-2 flex items-baseline justify-between gap-2">
            <h2 className="font-display text-[1.05rem] tracking-tight">今天的场景</h2>
            <span className="text-[11px] text-muted-foreground">
              点一下切换默认设置 · 共 {SCENARIOS.length} 个
            </span>
          </div>
          <div
            className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap"
            data-testid="scenario-grid"
          >
            {SCENARIOS.map((s) => {
              const active = scenarioId === s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => applyScenario(s.id)}
                  data-testid={`scenario-tab-${s.id}`}
                  className={`flex w-full items-center gap-2 rounded-full border px-3 py-2 text-[13px] transition-colors hover-elevate active-elevate-2 sm:w-auto ${
                    active
                      ? "border-primary/50 bg-primary text-primary-foreground"
                      : "border-border bg-card/60 text-foreground/80"
                  }`}
                >
                  <span aria-hidden className="text-base">{s.emoji}</span>
                  <span className="truncate">{s.label}</span>
                </button>
              );
            })}
          </div>
          <p className="mt-1.5 text-[11.5px] text-muted-foreground" data-testid="text-scenario-desc">
            {getScenario(scenarioId).description}
          </p>
          {(scenarioId === "personal-cut" || scenarioId === "fitness-bulk") &&
            !(profile?.planEnabled && profile.body) && (
              <button
                type="button"
                onClick={() => setProfileOpen(true)}
                data-testid="banner-enable-plan"
                className="mt-2 inline-flex w-full items-start gap-2 rounded-lg border border-primary/40 bg-primary/5 px-3 py-2 text-left text-[12px] hover-elevate active-elevate-2 sm:w-auto"
              >
                <Flame className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-primary" />
                <span className="flex-1 text-foreground/85">
                  开启饮食计划后可按热量精细推荐 — 填身高 / 体重 / 活动量即可
                  <span className="ml-1 text-primary underline-offset-2 hover:underline">去设置</span>
                </span>
              </button>
          )}
        </section>

        {/* 历史 / 收藏 快捷入口（始终展示，方便发现） */}
        <section className="mt-3 flex flex-wrap gap-2" data-testid="quick-history-fav">
          <button
            type="button"
            onClick={() => {
              const el = document.getElementById("history-fav-section");
              if (el) {
                el.scrollIntoView({ behavior: "smooth", block: "start" });
              } else {
                toast({
                  title: "还没有历史记录",
                  description: "在结果页点「就吃这个了」会保存到本地浏览器。",
                });
              }
            }}
            data-testid="button-quick-history"
            className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-card/60 px-3 py-1.5 text-[12.5px] text-foreground/85 hover-elevate active-elevate-2"
          >
            <HistoryIcon className="h-3.5 w-3.5 text-primary" />
            最近就吃了
            <span className="rounded-full bg-primary/10 px-1.5 text-[11px] text-primary num">
              {history.length}
            </span>
          </button>
          <button
            type="button"
            onClick={() => {
              const el = document.getElementById("history-fav-section");
              if (el) {
                el.scrollIntoView({ behavior: "smooth", block: "start" });
              } else {
                toast({
                  title: "还没有收藏",
                  description: "点菜卡上的爱心收藏起来；下次推荐会有更高几率出现。",
                });
              }
            }}
            data-testid="button-quick-fav"
            className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-card/60 px-3 py-1.5 text-[12.5px] text-foreground/85 hover-elevate active-elevate-2"
          >
            <Heart className={`h-3.5 w-3.5 ${favorites.size > 0 ? "fill-rose-500 text-rose-500" : "text-rose-500"}`} />
            我收藏的菜
            <span className="rounded-full bg-rose-50 px-1.5 text-[11px] text-rose-600 num">
              {favorites.size}
            </span>
          </button>
          <span className="ml-auto self-center text-[11px] text-muted-foreground">
            数据仅保存在你浏览器本地
          </span>
        </section>

        {/* 上下文条：登录 / 环境 / 饮食计划 */}
        <section className="mt-5">
          <Card className="grain border-card-border/60 bg-card/70 px-4 py-3 sm:px-5">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[12.5px]">
              <button
                type="button"
                onClick={() => setProfileOpen(true)}
                data-testid="chip-profile-summary"
                className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-primary hover-elevate active-elevate-2"
              >
                <UserCircle2 className="h-3.5 w-3.5" />
                {profile ? `Hi, ${profile.nickname}` : "未登录 — 通用推荐"}
              </button>
              <button
                type="button"
                onClick={() => setProfileOpen(true)}
                data-testid="chip-env-summary"
                className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background/60 px-3 py-1 text-foreground/80 hover-elevate active-elevate-2"
              >
                <Cloud className="h-3.5 w-3.5" />
                {env.city || env.province || (env.region === "未指定" ? "地区未设" : env.region)}
                <span className="text-muted-foreground">·</span>
                {env.weather === "未指定" ? "天气未设" : env.weather}
                {env.temperatureC !== undefined && (
                  <span className="num text-muted-foreground">{env.temperatureC}°C</span>
                )}
                <span className="text-muted-foreground">·</span>
                <CalendarDays className="h-3 w-3" />
                {recommendCtx.env?.season} / {recommendCtx.env?.dayKind === "weekend" ? "周末" : "工作日"}
              </button>
              {profile?.planEnabled && profile.body && (
                <span
                  className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 font-medium text-primary"
                  data-testid="chip-plan-summary"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  {SLOT_LABELS[profile.slot]} 目标 ≈
                  <span className="num">
                    {computePlan(profile.body, profile.slot).mealCalories}
                  </span>
                  kcal
                </span>
              )}
              <label className="ml-auto inline-flex cursor-pointer items-center gap-2 rounded-full border border-border/60 bg-background/60 px-3 py-1 hover-elevate">
                <Repeat className="h-3.5 w-3.5 text-primary" />
                <span>不吃重复的</span>
                <Switch
                  checked={noRepeat}
                  onCheckedChange={onToggleNoRepeat}
                  data-testid="switch-no-repeat"
                />
              </label>
            </div>
          </Card>
        </section>

        {/* 偏好表单 */}
        <section className="mt-7">
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

            <div className="mb-5 flex flex-wrap items-center gap-x-5 gap-y-3 rounded-lg border border-border/60 bg-background/50 p-3">
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
              <div className="ml-auto flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
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
              {plan ? "换一组试试" : `${meal.label}吃什么 →`}
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
              <h2 className="font-display text-[1.4rem] tracking-tight">{meal.label}就吃这些</h2>
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

            {/* 控卡 / 增肌 但未启用饮食计划：显眼引导 */}
            {calorieHintNeeded && (
              <Card
                className="mb-3 border-primary/40 bg-primary/5 p-3 text-[13px]"
                data-testid="panel-calorie-hint"
              >
                <div className="flex items-start gap-2">
                  <Flame className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                  <div className="flex-1">
                    <div className="font-medium text-foreground">
                      想按热量精细推荐？开启饮食计划即可
                    </div>
                    <p className="mt-0.5 text-[11.5px] text-muted-foreground">
                      你选了「{getScenario(scenarioId).label}」。在档案里填身高 / 体重 / 活动量并开启饮食计划，
                      推荐就会给出本餐目标热量、人均合计、偏轻 / 接近 / 偏高的评估。所有数据只保存在你的浏览器里。
                    </p>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => setProfileOpen(true)}
                    data-testid="button-open-profile-from-calorie-hint"
                    className="h-8 rounded-full text-[12px]"
                  >
                    去设置
                  </Button>
                </div>
              </Card>
            )}

            {/* 餐次热量汇总 */}
            {calSummary && (
              <Card
                className={`mb-3 border-primary/40 bg-primary/5 p-3 text-[13px] ${
                  calSummary.verdict === "ok"
                    ? ""
                    : "border-amber-500/40 bg-amber-500/5"
                }`}
                data-testid="panel-calorie-summary"
              >
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span className="font-display text-[15px] text-primary">
                    <Flame className="mr-1 inline h-4 w-4" /> 本餐热量评估
                  </span>
                  <span className="num">
                    人均合计 <span className="font-medium text-primary">{calSummary.perPersonTotal}</span> kcal
                  </span>
                  <span className="num text-muted-foreground">
                    目标 {calSummary.targetMealCalories} kcal
                  </span>
                  <span className="num text-muted-foreground">
                    差距 {calSummary.gap > 0 ? "+" : ""}{calSummary.gap} kcal
                  </span>
                  <Badge
                    variant="outline"
                    className={`ml-auto rounded-full px-2 py-0 text-[11.5px] ${
                      calSummary.verdict === "ok"
                        ? "border-primary/50 text-primary"
                        : "border-amber-500/60 text-amber-700"
                    }`}
                    data-testid="badge-calorie-verdict"
                  >
                    {calSummary.verdict === "ok"
                      ? "本餐热量接近目标"
                      : calSummary.verdict === "low"
                        ? "本餐热量偏轻"
                        : "本餐热量偏高"}
                  </Badge>
                </div>
                <p className="mt-1 text-[11.5px] text-muted-foreground">
                  这是<strong className="text-foreground/85">这一餐</strong>的估算热量，不代表你的身体状态。按档案里的身高/体重/活动量推算今日餐次目标后做对比。
                </p>
                {calSummary.verdict === "low" && (
                  <p
                    className="mt-1 text-[11.5px] text-amber-700"
                    data-testid="text-calorie-tip-low"
                  >
                    {scenarioId === "personal-cut"
                      ? "控卡场景下偏低是可以接受的；如果会饿，可以加一份主食或一碗汤。"
                      : scenarioId === "fitness-bulk"
                        ? "增肌场景建议补充：可以「换一组」或加一道主菜 / 一份米饭。"
                        : "如果想吃饱一点：可以加一份主食、再换一道高热量主菜。"}
                  </p>
                )}
                {calSummary.verdict === "high" && (
                  <p
                    className="mt-1 text-[11.5px] text-amber-700"
                    data-testid="text-calorie-tip-high"
                  >
                    本餐热量偏高 — 可以减一道主菜 / 改素菜搭配，或拉长用餐节奏。
                  </p>
                )}
              </Card>
            )}

            <div className="grid gap-3">
              {plan.mains.map((r) => (
                <DishCard
                  key={r.id}
                  recipe={r}
                  locked={lockedIds.has(r.id)}
                  favorite={favorites.has(r.id)}
                  onToggleLock={() => toggleLock(r.id)}
                  onSwap={() => swapOne(r)}
                  onOpenDetail={() => setDetailRecipe(r)}
                  onToggleFavorite={() => onToggleFavorite(r.id)}
                  targetMealCal={recommendCtx.targetMealCalories}
                />
              ))}
              {plan.veggie && (
                <DishCard
                  recipe={plan.veggie}
                  locked={lockedIds.has(plan.veggie.id)}
                  favorite={favorites.has(plan.veggie.id)}
                  onToggleLock={() => toggleLock(plan.veggie!.id)}
                  onSwap={() => swapOne(plan.veggie!)}
                  onOpenDetail={() => setDetailRecipe(plan.veggie!)}
                  onToggleFavorite={() => onToggleFavorite(plan.veggie!.id)}
                  targetMealCal={recommendCtx.targetMealCalories}
                />
              )}
              {plan.soup && (
                <DishCard
                  recipe={plan.soup}
                  locked={lockedIds.has(plan.soup.id)}
                  favorite={favorites.has(plan.soup.id)}
                  onToggleLock={() => toggleLock(plan.soup!.id)}
                  onSwap={() => swapOne(plan.soup!)}
                  onOpenDetail={() => setDetailRecipe(plan.soup!)}
                  onToggleFavorite={() => onToggleFavorite(plan.soup!.id)}
                  targetMealCal={recommendCtx.targetMealCalories}
                />
              )}
            </div>

            {/* 「就吃这个了」按钮 */}
            {planToList(plan).length > 0 && (
              <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
                <Button
                  variant="default"
                  className="h-12 flex-1 gap-2 rounded-full"
                  onClick={onSelectThis}
                  data-testid="button-pick-this"
                >
                  <CheckCircle2 className="h-4 w-4" /> 就吃这个了 · 记到本地历史
                </Button>
              </div>
            )}

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

        {/* 饭桌陪伴 */}
        <CompanionPanel ctx={companionCtx} />

        {/* 历史 / 收藏 */}
        {(history.length > 0 || favorites.size > 0) && (
          <section
            id="history-fav-section"
            className="mt-10 grid gap-3 sm:grid-cols-2"
            data-testid="section-history-fav"
          >
            {history.length > 0 && (
              <Card className="border-card-border/60 bg-card/60 p-4">
                <div className="mb-2 flex items-center gap-2">
                  <HistoryIcon className="h-4 w-4 text-primary" />
                  <h3 className="font-display text-[1.05rem] tracking-tight">最近就吃了</h3>
                  <span className="ml-auto text-[11px] text-muted-foreground num">
                    {history.length} 条
                  </span>
                </div>
                <ul className="space-y-2" data-testid="list-history">
                  {history.slice(0, 5).map((e) => (
                    <li
                      key={e.ts}
                      className="rounded-lg border border-border/60 bg-background/40 px-3 py-2 text-[12.5px]"
                      data-testid={`history-${e.ts}`}
                    >
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="text-muted-foreground num">
                          {new Date(e.ts).toLocaleDateString("zh-CN")} ·{" "}
                          {e.scenario ?? ""} {e.slot ?? ""}
                        </span>
                      </div>
                      <div className="mt-0.5 truncate">{e.names.join(" · ")}</div>
                    </li>
                  ))}
                </ul>
                <p className="mt-2 text-[11px] text-muted-foreground">
                  打开「不吃重复的」开关，未来推荐会避开这些菜。
                </p>
              </Card>
            )}
            {favorites.size > 0 && (
              <Card className="border-card-border/60 bg-card/60 p-4">
                <div className="mb-2 flex items-center gap-2">
                  <Heart className="h-4 w-4 fill-rose-500 text-rose-500" />
                  <h3 className="font-display text-[1.05rem] tracking-tight">我收藏的菜</h3>
                  <span className="ml-auto text-[11px] text-muted-foreground num">
                    {favorites.size} 道
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5" data-testid="list-favorites">
                  {Array.from(favorites)
                    .map((id) => RECIPES.find((r) => r.id === id))
                    .filter((r): r is Recipe => !!r)
                    .slice(0, 12)
                    .map((r) => (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => setDetailRecipe(r)}
                        className="rounded-full border border-rose-300/60 bg-rose-50/80 px-2.5 py-1 text-[12px] hover-elevate"
                        data-testid={`fav-chip-${r.id}`}
                      >
                        {r.name}
                      </button>
                    ))}
                </div>
                <p className="mt-2 text-[11px] text-muted-foreground">
                  收藏过的菜在未来推荐中会有更高几率出现。
                </p>
              </Card>
            )}
          </section>
        )}

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
        onFavoriteChange={refreshFavorites}
      />

      <ProfileDialog
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
        onChange={refreshProfile}
        env={env}
        onEnvChange={applyEnv}
      />

      <Onboarding
        open={onboardingOpen}
        onPick={(id) => {
          applyScenario(id, { silent: true });
          markOnboarded();
          setOnboardingOpen(false);
        }}
        onSkip={() => {
          markOnboarded();
          setOnboardingOpen(false);
        }}
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
    reasons.push(
      `你的忌口组合在 ${RECIPES.length} 道示例菜里没有完全匹配的菜。可以尝试关闭「配素菜 / 配汤」或减少忌口标签。`,
    );
  }
  return reasons.join(" ");
}
