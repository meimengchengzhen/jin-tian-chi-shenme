// 零食 / 饮料数据：301 条真实超市 / 便利店 / 美团闪购可买的具体商品
// 来源：real_snacks_research.json（已通过 script/import-real-data.ts 生成）。
// 字段含 大致热量 / 糖 / 脂肪 / 蛋白质 / 适合人群 / 真实品牌名。
// 这不是医疗建议。

import { REAL_SNACKS } from "./snacks.generated";
import type { Snack, SnackAudience, SnackCategory } from "./snacks.types";

export type { Snack, SnackAudience, SnackCategory } from "./snacks.types";

export const SNACKS: Snack[] = REAL_SNACKS;

export interface SnackPickInput {
  audiences: SnackAudience[];
  maxCalories?: number;
  preferCategories?: SnackCategory[];
}

export interface SnackPickResult {
  special: Snack;
  alternatives: Snack[];
  decisionLine: string;
}

export function pickSnack(input: SnackPickInput): SnackPickResult {
  const scored = SNACKS.map((s) => {
    let score = 0;
    const aHits = input.audiences.filter((a) => s.audiences.includes(a)).length;
    score += aHits * 12;
    if (input.preferCategories?.includes(s.category)) score += 10;
    if (input.maxCalories && s.calories > input.maxCalories) score -= 14;
    if (input.audiences.includes("减脂") || input.audiences.includes("控糖")) {
      if ((s.sugar ?? 0) <= 5) score += 8;
      if ((s.fat ?? 0) <= 6) score += 6;
      if (s.category === "无糖饮料" || s.category === "蛋白零食") score += 8;
    }
    if (input.audiences.includes("增肌")) {
      if ((s.protein ?? 0) >= 8) score += 12;
    }
    if (input.audiences.includes("儿童")) {
      if (s.category === "酸奶乳品" || s.category === "面包糕点" || s.category === "果干蜜饯") score += 8;
      if (s.caution?.includes("控糖") || (s.sugar ?? 0) > 30) score -= 6;
    }
    if (input.audiences.includes("长辈")) {
      if ((s.sugar ?? 0) <= 8) score += 6;
      if (s.category === "酸奶乳品" || s.category === "坚果") score += 8;
    }
    // A 真实商品加权（regenerated.ts 全部为真实商品，但保留逻辑兼容）
    if (s.confidence === "A") score += 4;
    score += Math.random() * 5;
    return { snack: s, score };
  }).sort((a, b) => b.score - a.score);

  const special = scored[0].snack;
  const alternatives = scored.slice(1, 6).map((s) => s.snack);
  const decisionLine = (() => {
    const tags = input.audiences.length > 0 ? input.audiences.join("·") : "随手买";
    return `今天替你决定：${special.name} — 适合「${tags}」`;
  })();
  return { special, alternatives, decisionLine };
}

/** 美团闪购 / 京东到家 / 淘宝 / 百度兜底搜索入口。
 *  v2: 美团闪购的 H5 直链多次改版导致 error_page，故主入口改走「百度站内搜索 site:meituan.com」走稳。
 *  v3: 优先用 brand + 商品名拼接，命中率更高。
 */
export function snackSearchLinks(name: string, extraKeywords?: string[]): { label: string; href: string; note?: string }[] {
  const q = encodeURIComponent(name);
  const expanded = encodeURIComponent([name, ...(extraKeywords || [])].join(" "));
  return [
    { label: "美团闪购（稳定搜索入口）", href: `https://www.baidu.com/s?wd=${encodeURIComponent("美团闪购 " + name)}` },
    { label: "京东到家搜", href: `https://search.jd.com/Search?keyword=${q}` },
    { label: "淘宝搜", href: `https://s.taobao.com/search?q=${q}` },
    { label: "百度搜", href: `https://www.baidu.com/s?wd=${expanded}` },
    { label: "美团闪购 直达（可能不可用）", href: `https://i.meituan.com/awp/h5/search/result.html?q=${q}`, note: "美团 H5 入口多次改版，可能 error_page" },
  ];
}
