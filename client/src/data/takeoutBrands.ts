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
  /** v4: 用户在 chip / 搜索框点名置顶的真实品牌 id（必须出现在主推荐池）。 */
  pinnedBrandId?: string;
  /** v4: 关键词模糊搜索（按 name / picks 匹配）。 */
  searchQuery?: string;
}

export interface TakeoutPickResult {
  special: TakeoutBrand;
  alternatives: TakeoutBrand[];
  decisionLine: string;
  perPerson: number;
  /** v4: 命中 pinned 但预算不匹配时的友好提示（不隐藏品牌）。 */
  budgetWarn?: string;
}

/** v4: 「热门真实品牌」chips —— 用户点名要求一定要可发现的连锁。
 *  数据顺序 = chip 显示顺序；name 必须能在 TAKEOUT_BRANDS 中按 includes 命中。 */
export const HOT_TAKEOUT_BRANDS: { label: string; matchName: string }[] = [
  { label: "肯德基", matchName: "肯德基" },
  { label: "麦当劳", matchName: "麦当劳" },
  { label: "达美乐", matchName: "达美乐" },
  { label: "牛约堡", matchName: "牛约堡" },
  { label: "正新鸡排", matchName: "正新鸡排" },
  { label: "德克士", matchName: "德克士" },
  { label: "华莱士", matchName: "华莱士" },
  { label: "塔斯汀", matchName: "塔斯汀" },
  { label: "必胜客", matchName: "必胜客" },
  { label: "老乡鸡", matchName: "老乡鸡" },
  { label: "乡村基", matchName: "乡村基" },
  { label: "大米先生", matchName: "大米先生" },
  { label: "茶百道", matchName: "茶百道" },
  { label: "霸王茶姬", matchName: "霸王茶姬" },
  { label: "瑞幸", matchName: "瑞幸" },
];

/** v4: 按精确名命中或前缀命中找到一个真实品牌（用于 chip 点击 / search 提交）。 */
export function findBrandByQuery(q: string): TakeoutBrand | undefined {
  const trimmed = (q || "").trim();
  if (!trimmed) return undefined;
  const exact = TAKEOUT_BRANDS.find((b) => b.name === trimmed);
  if (exact) return exact;
  const startsWith = TAKEOUT_BRANDS.find((b) => b.name.startsWith(trimmed));
  if (startsWith) return startsWith;
  const contains = TAKEOUT_BRANDS.find(
    (b) => b.name.includes(trimmed) || (b.picks || []).some((p) => p.name.includes(trimmed)),
  );
  return contains;
}

/** v4: 用 query 过滤出全部命中的品牌列表（最多 8 条）。 */
export function searchBrands(q: string, limit = 8): TakeoutBrand[] {
  const trimmed = (q || "").trim();
  if (!trimmed) return [];
  const hits: TakeoutBrand[] = [];
  for (const b of TAKEOUT_BRANDS) {
    if (
      b.name.includes(trimmed) ||
      (b.picks || []).some((p) => p.name.includes(trimmed)) ||
      b.intro.includes(trimmed)
    ) {
      hits.push(b);
      if (hits.length >= limit) break;
    }
  }
  return hits;
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

  // v4: pinnedBrandId 强制置顶 — 即便预算不符，也用品牌作为 special，并给出预算提示。
  let special = scored[0].brand;
  let alternatives = scored.slice(1, 5).map((s) => s.brand);
  let budgetWarn: string | undefined;
  if (input.pinnedBrandId) {
    const pinned = TAKEOUT_BRANDS.find((b) => b.id === input.pinnedBrandId);
    if (pinned) {
      const inBudget = perPerson >= pinned.budgetMin && perPerson <= pinned.budgetMax;
      if (!inBudget) {
        if (perPerson < pinned.budgetMin) {
          budgetWarn = `${pinned.name} 人均 ¥${pinned.budgetMin}-${pinned.budgetMax}，可能超出当前 ¥${perPerson} 预算 · 建议加预算或拼单`;
        } else {
          budgetWarn = `${pinned.name} 客单价低于当前预算 ¥${perPerson}，可能更适合多人共享或加菜`;
        }
      }
      special = pinned;
      // alternatives: 去重后从 scored 取 4 个
      alternatives = scored.filter((s) => s.brand.id !== pinned.id).slice(0, 4).map((s) => s.brand);
    }
  } else if (input.searchQuery) {
    const hits = searchBrands(input.searchQuery, 6);
    if (hits.length > 0) {
      special = hits[0];
      const fillerScore = scored.filter((s) => s.brand.id !== hits[0].id).map((s) => s.brand);
      const rest = [...hits.slice(1), ...fillerScore].slice(0, 4);
      const seen = new Set<string>([special.id]);
      alternatives = [];
      for (const b of rest) {
        if (seen.has(b.id)) continue;
        seen.add(b.id);
        alternatives.push(b);
        if (alternatives.length >= 4) break;
      }
      const inBudget = perPerson >= special.budgetMin && perPerson <= special.budgetMax;
      if (!inBudget) {
        budgetWarn = perPerson < special.budgetMin
          ? `${special.name} 人均 ¥${special.budgetMin}-${special.budgetMax}，可能超出当前 ¥${perPerson} 预算 · 建议加预算或拼单`
          : `${special.name} 客单价低于当前预算 ¥${perPerson}，可能更适合多人共享或加菜`;
      }
    }
  }

  const decisionLine = (() => {
    const parts: string[] = [];
    if (input.pinnedBrandId || input.searchQuery) parts.push("已置顶你点名的品牌");
    if (input.lowCalorie) parts.push("减脂友好优先");
    if (input.tastes.length > 0) parts.push(`偏好「${input.tastes.join("·")}」`);
    if (input.slot === "breakfast") parts.push("早餐场景");
    if (input.slot === "midnight") parts.push("深夜");
    if (parts.length === 0) parts.push(`人均 ${perPerson} 元 · ${input.people} 人`);
    return `今天替你决定：${special.name} — ${parts.join(" / ")}`;
  })();

  return { special, alternatives, decisionLine, perPerson, budgetWarn };
}
