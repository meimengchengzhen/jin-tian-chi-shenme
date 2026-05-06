// 推荐算法 — 模块化、可替换。
// 评分构成：
//   随机扰动 + 偏好命中（口味/菜系/难度） + 用户档案口味（liked/disliked）
//   + 环境上下文（天气/季节/地区/餐次/能量标签）
//   + 餐次目标热量匹配（与人均热量越近分越高，按 caloriePriority 加权）
//   + 场景调权（preferTastes / energyHints / 难度提示）
//   + 收藏加分（favorites）/ 历史降权（recentIds）
// 硬性约束：忌口（素食 / 无肉 / 无辣 等）始终遵守。

import type {
  Recipe,
  Cuisine,
  Taste,
  Restriction,
  Difficulty,
  Course,
  IngredientCategory,
  EnergyTag,
  WeatherTag,
  Season,
  RegionTag,
  MealSlotTag,
} from "@/data/recipes";
import { RECIPES } from "@/data/recipes";
import { perPersonCaloriesOf } from "./calories";
import type { FlavorPreference } from "./profile";
import type { ResolvedEnv } from "./environment";
import type { ScenarioPreset } from "./scenarios";

export interface Preferences {
  servings: number; // 1..8
  /** 总用时上限 (分钟)，超过则不推荐 */
  maxTimeMinutes: number;
  tastes: Taste[]; // 偏好（任一命中即加分）
  restrictions: Restriction[];
  cuisines: Cuisine[]; // 空数组 = 不限
  difficulties: Difficulty[]; // 空数组 = 不限
  /** 是否带汤 */
  withSoup: boolean;
  /** 是否带素菜 */
  withVeggie: boolean;
  /** 主菜数量 (默认 1) */
  mainCount: number;
}

export const DEFAULT_PREFS: Preferences = {
  servings: 3,
  maxTimeMinutes: 60,
  tastes: [],
  restrictions: [],
  cuisines: [],
  difficulties: [],
  withSoup: true,
  withVeggie: true,
  mainCount: 1,
};

/** 推荐上下文（可选）。无登录时也能完整工作。 */
export interface RecommendContext {
  flavor?: FlavorPreference;
  env?: ResolvedEnv;
  /** 目标人均热量，用于软匹配（kcal） */
  targetMealCalories?: number;
  /** 当前餐次（早/午/晚） */
  slot?: MealSlotTag;
  /** 当前场景预设（影响调权） */
  scenario?: ScenarioPreset;
  /** 收藏菜品 id 集合，加分 */
  favorites?: Set<string>;
  /** 近期已吃过的菜品 id 集合，降权（开启「不吃重复」时） */
  recentIds?: Set<string>;
  /** 是否启用「不吃重复」软规则 */
  noRepeat?: boolean;
}

// === 硬性约束（无论如何都必须满足）===
function violatesHardRestrictions(recipe: Recipe, prefs: Preferences): boolean {
  for (const r of prefs.restrictions) {
    if (recipe.contains.includes(r)) return true;
  }
  if (prefs.restrictions.includes("素食")) {
    const meaty = recipe.ingredients.some((i) => {
      if (i.category !== "肉蛋豆制品") return false;
      return /鸡|猪|牛|羊|鱼|虾|肉|排骨|皮蛋|鸡蛋|蛋|火腿|腊肠|卤/.test(i.name) && !/豆腐|腐竹|豆干|黄豆/.test(i.name);
    });
    if (meaty) return true;
  }
  if (prefs.restrictions.includes("无辣")) {
    if (recipe.tastes.some((t) => t === "微辣" || t === "重辣" || t === "麻辣")) return true;
  }
  return false;
}

// === 软性约束（兜底时可逐级放宽）===
// level: 0=全部生效；1=放宽难度；2=放宽菜系；3=放宽用时上限。
function passesSoftConstraints(recipe: Recipe, prefs: Preferences, level: number): boolean {
  if (level < 3 && recipe.timeMinutes > prefs.maxTimeMinutes) return false;
  if (level < 2 && prefs.cuisines.length > 0 && !prefs.cuisines.includes(recipe.cuisine)) return false;
  if (level < 1 && prefs.difficulties.length > 0 && !prefs.difficulties.includes(recipe.difficulty)) return false;
  return true;
}

function buildPool(prefs: Preferences, level: number): Recipe[] {
  return RECIPES.filter(
    (r) => !violatesHardRestrictions(r, prefs) && passesSoftConstraints(r, prefs, level),
  );
}

// === 评分 ===
function envEnergyForWeather(weather: WeatherTag | undefined): EnergyTag[] {
  if (!weather || weather === ("未指定" as WeatherTag)) return [];
  switch (weather) {
    case "热":
      return ["解暑", "清爽", "适合热"];
    case "冷":
      return ["驱寒", "暖胃", "适合冷"];
    case "雨":
      return ["暖胃", "适合雨天"];
    case "晴":
      return ["清爽"];
    case "潮湿":
      return ["暖胃"];
    case "干燥":
      return ["清爽"];
    default:
      return [];
  }
}

export function scoreRecipe(
  recipe: Recipe,
  prefs: Preferences,
  ctx: RecommendContext = {},
): number {
  let s = Math.random() * 0.6; // 随机扰动

  // 1) 当前 prefs 的口味命中
  if (prefs.tastes.length > 0) {
    const overlap = recipe.tastes.filter((t) => prefs.tastes.includes(t)).length;
    s += overlap * 1.4;
  }
  if (prefs.cuisines.length > 0 && prefs.cuisines.includes(recipe.cuisine)) s += 0.6;
  if (prefs.difficulties.length > 0 && prefs.difficulties.includes(recipe.difficulty)) s += 0.4;
  s += Math.max(0, (prefs.maxTimeMinutes - recipe.timeMinutes) / 120);

  // 2) 用户档案口味偏好
  if (ctx.flavor) {
    if (ctx.flavor.liked.length > 0) {
      const liked = recipe.tastes.filter((t) => ctx.flavor!.liked.includes(t)).length;
      s += liked * 0.9;
    }
    if (ctx.flavor.disliked.length > 0) {
      const disliked = recipe.tastes.filter((t) => ctx.flavor!.disliked.includes(t)).length;
      s -= disliked * 1.2;
    }
    if (ctx.flavor.cuisines.length > 0 && ctx.flavor.cuisines.includes(recipe.cuisine)) {
      s += 0.4;
    }
  }

  // 3) 环境（季节/天气/地区/餐次）
  if (ctx.env) {
    const w = ctx.env.weather === "未指定" ? undefined : (ctx.env.weather as WeatherTag);
    const energyTags = envEnergyForWeather(w);
    if (energyTags.length > 0 && recipe.energy && recipe.energy.length > 0) {
      const overlap = recipe.energy.filter((t) => energyTags.includes(t)).length;
      s += overlap * 0.7;
    }
    if (recipe.seasons && recipe.seasons.includes(ctx.env.season)) s += 0.5;
    if (ctx.env.region !== "未指定" && recipe.regions && recipe.regions.includes(ctx.env.region as RegionTag)) {
      s += 0.4;
    }
    if (ctx.env.dayKind === "weekend" && recipe.difficulty === "进阶") s += 0.25;
    if (ctx.env.dayKind === "weekday" && recipe.energy?.includes("快手")) s += 0.3;
  }

  // 4) 餐次匹配
  if (ctx.slot && recipe.slots && recipe.slots.length > 0) {
    if (recipe.slots.includes(ctx.slot)) s += 0.3;
  }

  // 5) 餐次目标热量匹配（人均）— 按场景的 caloriePriority 加权
  if (ctx.targetMealCalories && ctx.targetMealCalories > 0) {
    const perPerson = perPersonCaloriesOf(recipe);
    if (perPerson > 0) {
      // 餐次构成软参照：主菜 ~50%，汤 ~15%，素 ~15%
      const courseShare =
        recipe.course === "main" ? 0.5
        : recipe.course === "soup" ? 0.18
        : recipe.course === "veggie" ? 0.18
        : 0.3;
      const target = ctx.targetMealCalories * courseShare;
      const diff = Math.abs(perPerson - target) / Math.max(target, 1);
      const priority = ctx.scenario?.caloriePriority ?? 1;
      // 越接近加分越多，最大 +1.6 * priority
      s += Math.max(0, 1.6 - diff * 1.6) * priority;
    }
  }

  // 6) 场景调权
  if (ctx.scenario) {
    if (ctx.scenario.preferTastes.length > 0) {
      const overlap = recipe.tastes.filter((t) => ctx.scenario!.preferTastes.includes(t)).length;
      s += overlap * 0.5;
    }
    if (ctx.scenario.energyHints.length > 0 && recipe.energy?.length) {
      const overlap = recipe.energy.filter((e) =>
        ctx.scenario!.energyHints.includes(e as any),
      ).length;
      s += overlap * 0.6;
    }
    if (
      ctx.scenario.defaultDifficulties.length > 0 &&
      ctx.scenario.defaultDifficulties.includes(recipe.difficulty)
    ) {
      s += 0.25;
    }
  }

  // 7) 收藏加分 / 历史降权
  if (ctx.favorites && ctx.favorites.has(recipe.id)) s += 1.2;
  if (ctx.noRepeat && ctx.recentIds && ctx.recentIds.has(recipe.id)) s -= 1.5;

  return s;
}

function pickFromCourse(
  course: Course,
  count: number,
  pool: Recipe[],
  prefs: Preferences,
  ctx: RecommendContext,
  excludeIds: Set<string>,
): Recipe[] {
  const candidates = pool.filter((r) => r.course === course && !excludeIds.has(r.id));
  if (candidates.length === 0) return [];
  const ranked = candidates
    .map((r) => ({ r, s: scoreRecipe(r, prefs, ctx) }))
    .sort((a, b) => b.s - a.s);
  const top = ranked.slice(0, Math.max(count * 3, 6));
  const picked: Recipe[] = [];
  while (picked.length < count && top.length > 0) {
    const idx = Math.floor(Math.random() * top.length);
    picked.push(top[idx].r);
    top.splice(idx, 1);
  }
  return picked;
}

export interface MealPlan {
  mains: Recipe[];
  veggie?: Recipe;
  soup?: Recipe;
  /** 兜底时被放宽的软性条件（人话），用于 UI 提示。空 / undefined 表示完美匹配。 */
  relaxedNotes?: string[];
  /** 即使全部放宽也仍然没有候选的 course（一般是硬性忌口太严格） */
  unmetCourses?: Course[];
}

const RELAX_LABELS: Record<number, string> = {
  1: "难度",
  2: "菜系",
  3: "总用时上限",
};

interface CourseRequirement {
  course: Course;
  count: number;
}

function pickWithFallback(
  req: CourseRequirement,
  prefs: Preferences,
  ctx: RecommendContext,
  excludeIds: Set<string>,
): { picked: Recipe[]; usedLevel: number } {
  let lastPicked: Recipe[] = [];
  for (let level = 0; level <= 3; level++) {
    const pool = buildPool(prefs, level);
    const picked = pickFromCourse(req.course, req.count, pool, prefs, ctx, excludeIds);
    if (picked.length >= req.count) {
      return { picked, usedLevel: level };
    }
    if (picked.length > lastPicked.length) lastPicked = picked;
  }
  return { picked: lastPicked, usedLevel: 3 };
}

export function recommend(
  prefs: Preferences,
  locked: Recipe[] = [],
  ctx: RecommendContext = {},
): MealPlan {
  const lockedIds = new Set(locked.map((r) => r.id));
  const lockedByCourse = (c: Course) => locked.filter((r) => r.course === c);

  const requirements: CourseRequirement[] = [];
  const lockedMains = lockedByCourse("main");
  const needMains = Math.max(0, prefs.mainCount - lockedMains.length);
  if (needMains > 0) requirements.push({ course: "main", count: needMains });
  let lockedVeg: Recipe | undefined;
  if (prefs.withVeggie) {
    lockedVeg = lockedByCourse("veggie")[0];
    if (!lockedVeg) requirements.push({ course: "veggie", count: 1 });
  }
  let lockedSoup: Recipe | undefined;
  if (prefs.withSoup) {
    lockedSoup = lockedByCourse("soup")[0];
    if (!lockedSoup) requirements.push({ course: "soup", count: 1 });
  }

  let maxLevel = 0;
  const unmetCourses: Course[] = [];
  const courseResults = new Map<Course, Recipe[]>();
  for (const req of requirements) {
    const { picked, usedLevel } = pickWithFallback(req, prefs, ctx, lockedIds);
    courseResults.set(req.course, picked);
    if (usedLevel > maxLevel) maxLevel = usedLevel;
    if (picked.length < req.count) unmetCourses.push(req.course);
    picked.forEach((r) => lockedIds.add(r.id));
  }

  const newMains = courseResults.get("main") ?? [];
  const mains = [...lockedMains, ...newMains];
  const veggie = lockedVeg ?? courseResults.get("veggie")?.[0];
  const soup = lockedSoup ?? courseResults.get("soup")?.[0];

  const relaxedNotes: string[] = [];
  for (let lvl = 1; lvl <= maxLevel; lvl++) {
    const label = RELAX_LABELS[lvl];
    if (label) relaxedNotes.push(label);
  }

  return {
    mains,
    veggie,
    soup,
    relaxedNotes: relaxedNotes.length > 0 ? relaxedNotes : undefined,
    unmetCourses: unmetCourses.length > 0 ? unmetCourses : undefined,
  };
}

export function planToList(plan: MealPlan): Recipe[] {
  const out: Recipe[] = [...plan.mains];
  if (plan.veggie) out.push(plan.veggie);
  if (plan.soup) out.push(plan.soup);
  return out;
}

/** 统计仅满足硬性忌口（不考虑菜系/难度/用时）的前提下，每个 course 还剩多少候选。 */
export function countByCourseUnderHardOnly(prefs: Preferences): Record<Course, number> {
  const counts: Record<Course, number> = { main: 0, veggie: 0, soup: 0, staple: 0 };
  for (const r of RECIPES) {
    if (violatesHardRestrictions(r, prefs)) continue;
    counts[r.course] += 1;
  }
  return counts;
}

// === 餐次热量汇总：把当前 plan 的人均总热量与目标对比 ===
export interface CalorieSummary {
  /** 当前 plan 全部菜的人均热量之和 */
  perPersonTotal: number;
  /** 目标餐次热量 */
  targetMealCalories: number;
  /** 差距（plan - target） */
  gap: number;
  /** 偏差比例 */
  ratio: number;
  /** 偏轻 / 刚好 / 偏高 */
  verdict: "low" | "ok" | "high";
}

export function calorieSummary(
  plan: MealPlan,
  targetMealCalories: number,
): CalorieSummary | null {
  if (!targetMealCalories || targetMealCalories <= 0) return null;
  const recipes = planToList(plan);
  if (recipes.length === 0) return null;
  let perPersonTotal = 0;
  for (const r of recipes) perPersonTotal += perPersonCaloriesOf(r);
  const gap = perPersonTotal - targetMealCalories;
  const ratio = gap / Math.max(targetMealCalories, 1);
  let verdict: "low" | "ok" | "high" = "ok";
  if (ratio <= -0.18) verdict = "low";
  else if (ratio >= 0.18) verdict = "high";
  return {
    perPersonTotal: Math.round(perPersonTotal),
    targetMealCalories: Math.round(targetMealCalories),
    gap: Math.round(gap),
    ratio,
    verdict,
  };
}

// === 买菜清单聚合 ===
export interface ShoppingItem {
  name: string;
  qty: string[];
  category: IngredientCategory;
  /** 来自哪些菜（用于在 UI 中提示） */
  fromRecipes: string[];
}

export function buildShoppingList(plan: MealPlan): Record<IngredientCategory, ShoppingItem[]> {
  const recipes = planToList(plan);
  const map = new Map<string, ShoppingItem>();
  for (const r of recipes) {
    for (const ing of r.ingredients) {
      const key = `${ing.category}::${ing.name}`;
      const existing = map.get(key);
      if (existing) {
        existing.qty.push(ing.qty);
        if (!existing.fromRecipes.includes(r.name)) existing.fromRecipes.push(r.name);
      } else {
        map.set(key, {
          name: ing.name,
          qty: [ing.qty],
          category: ing.category,
          fromRecipes: [r.name],
        });
      }
    }
  }

  const grouped: Record<IngredientCategory, ShoppingItem[]> = {
    "蔬菜": [],
    "肉蛋豆制品": [],
    "调味/主食": [],
  };
  Array.from(map.values()).forEach((item) => {
    grouped[item.category].push(item);
  });
  (Object.keys(grouped) as IngredientCategory[]).forEach((cat) => {
    grouped[cat].sort((a, b) => a.name.localeCompare(b.name, "zh"));
  });
  return grouped;
}

export function shoppingListToText(plan: MealPlan): string {
  const grouped = buildShoppingList(plan);
  const recipes = planToList(plan);
  const lines: string[] = [];
  lines.push(`【今日买菜清单】 (${recipes.length} 道菜)`);
  lines.push(recipes.map((r) => r.name).join(" · "));
  lines.push("");
  for (const cat of ["蔬菜", "肉蛋豆制品", "调味/主食"] as IngredientCategory[]) {
    const items = grouped[cat];
    if (items.length === 0) continue;
    lines.push(`◇ ${cat}`);
    for (const it of items) {
      lines.push(`  · ${it.name}  ${it.qty.join(" / ")}`);
    }
    lines.push("");
  }
  return lines.join("\n").trim();
}
