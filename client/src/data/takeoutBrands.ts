// 外卖品牌库：305 条真实品牌（A+B 高置信连锁/区域品牌）+ 推荐菜单 + 适合预算 / 人数 / 口味 / 热量。
// 数据由 script/import-real-data.ts 从 real_takeout_brands_research.json 自动生成；
// 不抓取任何商户 / 平台 API；图片用首字 + emoji + 类目渐变 fallback，避免商标硬链。
//
// 主推荐池 = REAL_TAKEOUT_BRANDS（A+B 真实品牌）。
// 品类模板（C 层）单独存放在 takeoutCategoryFallback.generated.ts，仅作品类备选展示，
// 名称带「（品类）」后缀，且不会进入 pickTakeout 的主推荐结果。

import { REAL_TAKEOUT_BRANDS } from "./takeoutBrands.generated";
import { TAKEOUT_CATEGORY_FALLBACK } from "./takeoutCategoryFallback.generated";
import type {
  TakeoutBrand,
  TakeoutCategory,
  TakeoutTaste,
} from "./takeoutBrands.types";

export type { TakeoutBrand, TakeoutCategory, TakeoutTaste } from "./takeoutBrands.types";

/** 主推荐池：305 条真实 A/B 品牌。 */
export const TAKEOUT_BRANDS: TakeoutBrand[] = REAL_TAKEOUT_BRANDS;

/** 品类模板（C 层）：仅作品类备选展示，不进入 pickTakeout 主推荐。 */
export const TAKEOUT_CATEGORY_TEMPLATES: TakeoutBrand[] = TAKEOUT_CATEGORY_FALLBACK;

export const TAKEOUT_CATEGORIES: TakeoutCategory[] = [
  "汉堡炸鸡", "中式快餐", "披萨意面", "粉面", "饭团便当",
  "烤肉烧烤", "饺子小笼", "茶饮咖啡", "奶茶饮品", "小吃零嘴",
  "火锅麻辣烫", "粥早餐", "甜品下午茶", "海鲜日料", "健康轻食", "面包烘焙",
];

export interface TakeoutPickInput {
  city?: string;
  budget: number;
  people: number;
  tastes: TakeoutTaste[];
  slot?: "breakfast" | "lunch" | "dinner" | "midnight";
  lowCalorie?: boolean;
}

export interface TakeoutPickResult {
  special: TakeoutBrand;
  alternatives: TakeoutBrand[];
  decisionLine: string;
  perPerson: number;
}

const SLOT_BIAS: Record<NonNullable<TakeoutPickInput["slot"]>, TakeoutCategory[]> = {
  breakfast: ["粥早餐", "面包烘焙", "茶饮咖啡"],
  lunch: ["中式快餐", "粉面", "汉堡炸鸡", "饺子小笼", "健康轻食"],
  dinner: ["火锅麻辣烫", "披萨意面", "中式快餐", "烤肉烧烤", "海鲜日料"],
  midnight: ["小吃零嘴", "汉堡炸鸡", "粉面"],
};

export function pickTakeout(input: TakeoutPickInput): TakeoutPickResult {
  const perPerson = Math.max(8, Math.round(input.budget / Math.max(1, input.people)));
  const slotCats = input.slot ? SLOT_BIAS[input.slot] : [];

  // 主推荐池：仅 A+B 真实品牌；C 模板永不进入主推荐。
  const scored = TAKEOUT_BRANDS.map((b) => {
    let score = 0;
    if (perPerson >= b.budgetMin && perPerson <= b.budgetMax) score += 30;
    else if (perPerson >= b.budgetMin * 0.85 && perPerson <= b.budgetMax * 1.15) score += 18;
    else score += Math.max(0, 10 - Math.abs(perPerson - (b.budgetMin + b.budgetMax) / 2) / 4);
    if (input.people >= b.peopleMin && input.people <= b.peopleMax) score += 18;
    const tasteHits = input.tastes.filter((t) => b.tastes.includes(t)).length;
    score += tasteHits * 8;
    if (slotCats.includes(b.category)) score += 12;
    if (input.lowCalorie) {
      if (b.tastes.includes("油腻")) score -= 10;
      if (b.tastes.includes("热量低") || b.category === "健康轻食" || b.category === "粥早餐") score += 14;
    }
    if (b.citySpread === "全国") score += 4;
    // A 层加权（高置信全国连锁优先）
    if (b.realTier === "A") score += 6;
    score += Math.random() * 6;
    return { brand: b, score };
  }).sort((a, b) => b.score - a.score);

  const special = scored[0].brand;
  const alternatives = scored.slice(1, 5).map((s) => s.brand);

  const decisionLine = (() => {
    const parts: string[] = [];
    if (input.lowCalorie) parts.push("减脂友好优先");
    if (input.tastes.length > 0) parts.push(`偏好「${input.tastes.join("·")}」`);
    if (input.slot === "breakfast") parts.push("早餐场景");
    if (input.slot === "midnight") parts.push("深夜");
    if (parts.length === 0) parts.push(`人均 ${perPerson} 元 · ${input.people} 人`);
    return `今天替你决定：${special.name} — ${parts.join(" / ")}`;
  })();

  return { special, alternatives, decisionLine, perPerson };
}
