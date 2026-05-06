// 推荐算法 — 模块化、可替换；后续可接入用户口味学习或后端 API。
import type {
  Recipe,
  Cuisine,
  Taste,
  Restriction,
  Difficulty,
  Course,
  Ingredient,
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

// 限制 -> 应排除的菜品判定函数
function isRecipeAllowed(recipe: Recipe, prefs: Preferences): boolean {
  // 限制：菜里包含的 contains 与 prefs.restrictions 有交集 -> 排除
  for (const r of prefs.restrictions) {
    if (recipe.contains.includes(r)) return false;
  }
  // 素食 = 排除所有含肉蛋海鲜的（简化：检查食材分类含「肉蛋豆制品」中是否有非豆制品关键字）
  if (prefs.restrictions.includes("素食")) {
    const meaty = recipe.ingredients.some((i) => {
      if (i.category !== "肉蛋豆制品") return false;
      return /鸡|猪|牛|羊|鱼|虾|肉|排骨|皮蛋|鸡蛋|蛋/.test(i.name) && !/豆腐|腐竹|豆干/.test(i.name);
    });
    if (meaty) return false;
  }
  if (prefs.restrictions.includes("无辣")) {
    if (recipe.tastes.some((t) => t === "微辣" || t === "重辣" || t === "麻辣")) return false;
  }
  // 时间限制
  if (recipe.timeMinutes > prefs.maxTimeMinutes) return false;
  // 菜系
  if (prefs.cuisines.length > 0 && !prefs.cuisines.includes(recipe.cuisine)) return false;
  // 难度
  if (prefs.difficulties.length > 0 && !prefs.difficulties.includes(recipe.difficulty)) return false;
  return true;
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
}

export function recommend(
  prefs: Preferences,
  locked: Recipe[] = [],
): MealPlan {
  const pool = RECIPES.filter((r) => isRecipeAllowed(r, prefs));
  const lockedIds = new Set(locked.map((r) => r.id));

  const lockedByCourse = (c: Course) => locked.filter((r) => r.course === c);

  // 主菜
  const lockedMains = lockedByCourse("main");
  const needMains = Math.max(0, prefs.mainCount - lockedMains.length);
  const newMains = pickFromCourse("main", needMains, pool, prefs, lockedIds);
  const mains = [...lockedMains, ...newMains];

  // 素菜
  let veggie: Recipe | undefined;
  if (prefs.withVeggie) {
    const lockedVeg = lockedByCourse("veggie")[0];
    if (lockedVeg) veggie = lockedVeg;
    else veggie = pickFromCourse("veggie", 1, pool, prefs, lockedIds)[0];
  }

  // 汤
  let soup: Recipe | undefined;
  if (prefs.withSoup) {
    const lockedSoup = lockedByCourse("soup")[0];
    if (lockedSoup) soup = lockedSoup;
    else soup = pickFromCourse("soup", 1, pool, prefs, lockedIds)[0];
  }

  return { mains, veggie, soup };
}

export function planToList(plan: MealPlan): Recipe[] {
  const out: Recipe[] = [...plan.mains];
  if (plan.veggie) out.push(plan.veggie);
  if (plan.soup) out.push(plan.soup);
  return out;
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
  for (const item of map.values()) {
    grouped[item.category].push(item);
  }
  for (const cat of Object.keys(grouped) as IngredientCategory[]) {
    grouped[cat].sort((a, b) => a.name.localeCompare(b.name, "zh"));
  }
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
