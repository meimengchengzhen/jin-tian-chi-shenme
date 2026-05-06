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
  /** 「换一批」级别的最近推荐池 — 始终生效的软降权，避免连续抽到同一道菜 */
  recentSwapIds?: Set<string>;
  /** 食材偏好（想吃什么）— 软偏好加分；不会违反硬忌口 */
  ingredientWish?: IngredientWishId[];
  /** 健康规则：低糖 / 低盐 / 低嘌呤 / 软烂 / 优质蛋白 */
  healthFilter?: HealthFilterId[];
}

/** 食材偏好 — 想吃什么。仅作为软评分加分。 */
export type IngredientWishId =
  | "beef"
  | "pork"
  | "chicken"
  | "seafood"
  | "tofu"
  | "vegetable"
  | "noodle"
  | "rice"
  | "dessert";

/** 健康规则 — 用关键词推断。仅作为软排序参考，不是硬性医疗承诺。 */
export type HealthFilterId =
  | "low-sugar"
  | "low-salt"
  | "low-oil"
  | "low-purine"
  | "soft-easy-digest"
  | "high-quality-protein";

const HEALTH_FILTER_LABEL: Record<HealthFilterId, string> = {
  "low-sugar": "低糖",
  "low-salt": "低盐",
  "low-oil": "低油",
  "low-purine": "低嘌呤",
  "soft-easy-digest": "软烂易消化",
  "high-quality-protein": "优质蛋白",
};

export function healthFilterLabel(id: HealthFilterId): string {
  return HEALTH_FILTER_LABEL[id] ?? id;
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
  // 「换一批」近期池：强降权，确保即使场景+心愿+热量加分叠加也翻不过来。
  if (ctx.recentSwapIds && ctx.recentSwapIds.has(recipe.id)) s -= 3.5;

  // 8) 食材偏好（想吃什么）— 软加分
  if (ctx.ingredientWish && ctx.ingredientWish.length > 0) {
    const blob = `${recipe.name} ${recipe.ingredients.map((i) => i.name).join(" ")} ${recipe.steps.join(" ")}`;
    for (const wish of ctx.ingredientWish) {
      if (matchesIngredientWish(wish, blob, recipe)) s += 0.9;
    }
  }

  // 9) 健康偏好 — 软加分；不通过的菜不剔除（用户可自行换一批）
  if (ctx.healthFilter && ctx.healthFilter.length > 0) {
    for (const flag of ctx.healthFilter) {
      if (passesHealthRule(flag, recipe)) s += 0.8;
      else s -= 0.4;
    }
  }

  return s;
}

const WISH_PATTERNS: Record<IngredientWishId, { pos: RegExp; neg?: RegExp }> = {
  beef: { pos: /牛肉|牛腩|牛排|肥牛|雪花牛|牛筋|牛舌|牛尾/ },
  pork: {
    pos: /猪肉|猪里脊|五花肉|排骨|里脊|梅花|肉末|肉丝|肉片|肉丁|叉烧|腊肉|腊肠|火腿|培根/,
    neg: /牛肉|鸡肉|羊肉|鸭肉|鱼肉|虾肉|蟹肉|植物肉/,
  },
  chicken: { pos: /鸡肉|鸡胸|鸡腿|鸡翅|鸡丁|鸡丝|鸡块|鸡爪|三黄鸡/ },
  seafood: { pos: /虾|鱼(?!香)|蟹|贝|蛤|蛎|鱿|墨鱼|带鱼|鲈|鲫|草鱼|三文|鳕|黄鱼|海鲜/ },
  tofu: { pos: /豆腐|豆干|腐竹|豆皮|百叶/ },
  vegetable: { pos: /白菜|青菜|菠菜|生菜|包菜|油菜|空心菜|西兰花|花菜|芹菜|茄子|黄瓜|番茄|西红柿|胡萝卜|土豆|莲藕|蘑菇|香菇|青椒|彩椒|尖椒|豆角|玉米|冬瓜|丝瓜|南瓜|韭菜/ },
  noodle: { pos: /面|粉条|粉丝|米线|河粉|馄饨|饺|包子|烧麦|饼|馍|年糕/ },
  rice: { pos: /米饭|炒饭|粥|焖饭|盖饭|拌饭|饭团|寿司|烩饭/ },
  dessert: { pos: /蛋糕|布丁|奶冻|双皮奶|果冻|马卡龙|塔派|月饼|糖水|甜品|糖醋|糖浆|蜂蜜|甜汤|蛋挞|可丽饼|奶茶|果汁/ },
};

function matchesIngredientWish(wish: IngredientWishId, blob: string, recipe: Recipe): boolean {
  const rule = WISH_PATTERNS[wish];
  if (!rule.pos.test(blob)) {
    // 类目兜底：dessert 可命中 category=甜品/饮品/烘焙
    if (wish === "dessert" && (recipe.category === "甜品" || recipe.category === "饮品" || recipe.category === "烘焙" || recipe.category === "下午茶")) {
      return true;
    }
    if (wish === "rice" && recipe.course === "staple" && /饭|粥/.test(recipe.name)) return true;
    if (wish === "noodle" && recipe.course === "staple" && /面|粉|饼/.test(recipe.name)) return true;
    return false;
  }
  if (rule.neg && rule.neg.test(blob)) return false;
  return true;
}

// === 健康规则 ===
// 仅基于现有 tags / ingredients / steps 关键词做粗略判断。
// 不构成医疗建议；只用于排序加分。
function passesHealthRule(flag: HealthFilterId, recipe: Recipe): boolean {
  const blob = `${recipe.ingredients.map((i) => i.name).join(" ")} ${recipe.steps.join(" ")}`;
  switch (flag) {
    case "low-sugar":
      // 不含糖/可乐/糖醋；口味不是「酸甜」（糖醋、糖油等）
      return (
        !/糖醋|可乐|冰糖|白糖|蜂蜜|果糖|麦芽糖|糖浆|甜面酱|糖油|蜜汁/.test(blob) &&
        !recipe.tastes.includes("酸甜")
      );
    case "low-salt":
      // 不含 高盐/重口 调料：豆瓣酱、老抽用量大、咸蛋、火腿、腊肉等
      return !/豆瓣酱|腊肉|腊肠|火腿(?!肠)|咸蛋|咸菜|榨菜|酱油.*大勺|老抽.*大勺|盐.*大勺|郫县/.test(blob);
    case "low-oil":
      return !/油.*大勺|食用油.*大勺|香油.*大勺|猪油|花生油.*大勺|炸|爆/.test(blob) || /蒸|煮|炖|焖/.test(blob);
    case "low-purine":
      // 嘌呤高源：动物内脏、海鲜、浓汤、火锅、卤味、肉汤
      return !/海鲜|虾|蟹|贝|蛤|鱼(?!香)|内脏|肝|心(?!粉)|肚|肠|脑|动物油|高汤|肉汤|浓汤|卤(?!水)/.test(blob);
    case "soft-easy-digest":
      // 软烂：粥、蒸、炖、煮、汤；不油炸、不爆炒
      if (/粥|蒸|炖|煮|焖|羹|汤/.test(`${recipe.name} ${recipe.steps.join(" ")}`)) return true;
      return recipe.course === "soup" || recipe.course === "veggie" && /煮|蒸/.test(blob);
    case "high-quality-protein":
      return /鸡胸|鸡蛋|鱼|虾|豆腐|腐竹|牛里脊|瘦肉|鸡腿肉(?!.*油炸)/.test(blob);
  }
}

export function listHealthMatches(recipe: Recipe): HealthFilterId[] {
  const out: HealthFilterId[] = [];
  for (const f of ["low-sugar", "low-salt", "low-oil", "low-purine", "soft-easy-digest", "high-quality-protein"] as HealthFilterId[]) {
    if (passesHealthRule(f, recipe)) out.push(f);
  }
  return out;
}

function pickFromCourse(
  course: Course,
  count: number,
  pool: Recipe[],
  prefs: Preferences,
  ctx: RecommendContext,
  excludeIds: Set<string>,
): Recipe[] {
  const baseCandidates = pool.filter((r) => r.course === course && !excludeIds.has(r.id));
  if (baseCandidates.length === 0) return [];

  // 会话级强排除：候选足够时（剩余 > count + 2）直接过滤掉最近抽过的菜，
  // 解决「连续 4 次抽到黑椒牛肉」这类同一会话内的高频重复。
  const ban = ctx.recentSwapIds;
  let candidates = baseCandidates;
  if (ban && ban.size > 0) {
    const filtered = baseCandidates.filter((r) => !ban.has(r.id));
    if (filtered.length >= count + 2) {
      candidates = filtered;
    } else if (filtered.length >= count) {
      // 刚好够，仍优先用这个池
      candidates = filtered;
    }
    // 否则（候选过少）保留全部，scoreRecipe 仍会软降权
  }

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
