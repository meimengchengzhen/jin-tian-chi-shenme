// 推荐算法 — 模块化、可替换；后续可接入用户口味学习或后端 API。
import type {
  Recipe,
  Cuisine,
  Taste,
  Restriction,
  Difficulty,
  Course,
  IngredientCategory,
} from "@/data/recipes";
import { RECIPES } from "@/data/recipes";

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

// === 硬性约束（无论如何都必须满足）===
// 忌口（素食 / 无海鲜 / 无猪肉 / 无牛肉 / 无蛋 / 无奶 / 无花生 / 无辣）：
// 这些是健康/伦理/过敏边界，不能被「兜底」违反。
function violatesHardRestrictions(recipe: Recipe, prefs: Preferences): boolean {
  for (const r of prefs.restrictions) {
    if (recipe.contains.includes(r)) return true;
  }
  // 素食：排除任何含肉/蛋/海鲜的菜（基于食材名启发式校验）
  if (prefs.restrictions.includes("素食")) {
    const meaty = recipe.ingredients.some((i) => {
      if (i.category !== "肉蛋豆制品") return false;
      return /鸡|猪|牛|羊|鱼|虾|肉|排骨|皮蛋|鸡蛋|蛋/.test(i.name) && !/豆腐|腐竹|豆干/.test(i.name);
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
// 口味偏好本来只用于打分（不参与过滤），所以无需放宽。
function passesSoftConstraints(
  recipe: Recipe,
  prefs: Preferences,
  level: number,
): boolean {
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

function score(recipe: Recipe, prefs: Preferences): number {
  let s = Math.random() * 0.6; // 随机扰动，保证「换一组」有变化
  if (prefs.tastes.length > 0) {
    const overlap = recipe.tastes.filter((t) => prefs.tastes.includes(t)).length;
    s += overlap * 1.4;
  }
  if (prefs.cuisines.length > 0 && prefs.cuisines.includes(recipe.cuisine)) s += 0.6;
  if (prefs.difficulties.length > 0 && prefs.difficulties.includes(recipe.difficulty)) s += 0.4;
  // 时间越短越加分（轻微）
  s += Math.max(0, (prefs.maxTimeMinutes - recipe.timeMinutes) / 120);
  return s;
}

function pickFromCourse(
  course: Course,
  count: number,
  pool: Recipe[],
  prefs: Preferences,
  excludeIds: Set<string>,
): Recipe[] {
  const candidates = pool.filter((r) => r.course === course && !excludeIds.has(r.id));
  if (candidates.length === 0) return [];
  const ranked = candidates
    .map((r) => ({ r, s: score(r, prefs) }))
    .sort((a, b) => b.s - a.s);
  // 取前 N=max(count*3, 5) 中随机选 count 个
  const top = ranked.slice(0, Math.max(count * 3, 5));
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
  excludeIds: Set<string>,
): { picked: Recipe[]; usedLevel: number } {
  // level 0..3：依次放宽难度、菜系、用时
  let lastPicked: Recipe[] = [];
  for (let level = 0; level <= 3; level++) {
    const pool = buildPool(prefs, level);
    const picked = pickFromCourse(req.course, req.count, pool, prefs, excludeIds);
    if (picked.length >= req.count) {
      return { picked, usedLevel: level };
    }
    if (picked.length > lastPicked.length) lastPicked = picked;
  }
  // 全部软性条件放宽后仍不够；返回最大努力得到的结果（可能为空，仅当硬性忌口已经把整个 course 清空）
  return { picked: lastPicked, usedLevel: 3 };
}

export function recommend(
  prefs: Preferences,
  locked: Recipe[] = [],
): MealPlan {
  const lockedIds = new Set(locked.map((r) => r.id));
  const lockedByCourse = (c: Course) => locked.filter((r) => r.course === c);

  const requirements: CourseRequirement[] = [];
  const lockedMains = lockedByCourse("main");
  const needMains = Math.max(0, prefs.mainCount - lockedMains.length);
  if (needMains > 0) {
    requirements.push({ course: "main", count: needMains });
  }
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
    const { picked, usedLevel } = pickWithFallback(req, prefs, lockedIds);
    courseResults.set(req.course, picked);
    if (usedLevel > maxLevel) maxLevel = usedLevel;
    if (picked.length < req.count) unmetCourses.push(req.course);
    // 把已选项加入 excludeIds，避免不同 course 之间重复（一般 course 不重叠，但 mainCount>1 时同 course 内部 pickFromCourse 已经处理）
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

/** 统计仅满足硬性忌口（不考虑菜系/难度/用时）的前提下，每个 course 还剩多少候选。
 *  用于在 UI 中诊断「忌口本身就把整个 course 清空了」的情形。 */
export function countByCourseUnderHardOnly(prefs: Preferences): Record<Course, number> {
  const counts: Record<Course, number> = { main: 0, veggie: 0, soup: 0, staple: 0 };
  for (const r of RECIPES) {
    if (violatesHardRestrictions(r, prefs)) continue;
    counts[r.course] += 1;
  }
  return counts;
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
