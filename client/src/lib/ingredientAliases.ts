// 食材别名规范化 + 食材级 token 抽取。
// 三大新功能（家庭口味协调 / 冰箱有啥 / 剩菜变花样）共用：
//  - 把"芫荽 / 西红柿 / 马铃薯"统一映射到"香菜 / 番茄 / 土豆"
//  - 从一条菜谱的 ingredients[].name 中抽取干净的食材标准名集合，过滤掉调味与主食
//  - 判断一段文本是否包含某个食材关键词（用于忌口/不喜欢匹配，不区分前后缀）
//
// 设计目标：纯函数 + 静态表，方便后续扩展，绝不依赖 localStorage / network。

import type { Ingredient } from "@/data/recipes";

// 别名映射：左边是常见输入或菜谱里出现的别名，右边是规范名。
// 注意：右边的规范名应当和 INGREDIENT_TABLE 中的标准名 / 常见菜谱 ingredient.name 保持一致。
const RAW_ALIASES: Record<string, string> = {
  // 蔬菜
  芫荽: "香菜",
  胡荽: "香菜",
  西红柿: "番茄",
  圣女果: "番茄",
  马铃薯: "土豆",
  洋芋: "土豆",
  土豆丝: "土豆",
  土豆片: "土豆",
  大葱: "葱",
  小葱: "葱",
  香葱: "葱",
  小香葱: "葱",
  葱花: "葱",
  葱段: "葱",
  葱白: "葱",
  生姜: "姜",
  姜片: "姜",
  姜丝: "姜",
  姜末: "姜",
  大蒜: "蒜",
  蒜末: "蒜",
  蒜片: "蒜",
  蒜瓣: "蒜",
  小米辣: "辣椒",
  干辣椒: "辣椒",
  尖椒: "青椒",
  螺丝椒: "青椒",
  彩椒: "青椒",
  红椒: "青椒",
  花椰菜: "西兰花",
  上海青: "青菜",
  小白菜: "青菜",
  小青菜: "青菜",
  油菜: "青菜",
  包菜: "白菜",
  圆白菜: "白菜",
  卷心菜: "白菜",
  娃娃菜: "白菜",
  四季豆: "豆角",
  长豆角: "豆角",
  老豆腐: "豆腐",
  嫩豆腐: "豆腐",
  内酯豆腐: "豆腐",
  豆腐干: "豆腐",
  腐竹: "豆腐",
  豆皮: "豆腐",
  // 肉蛋
  五花肉: "猪肉",
  里脊肉: "猪肉",
  瘦肉: "猪肉",
  肉丝: "猪肉",
  肉末: "猪肉",
  排骨: "猪肉",
  猪排骨: "猪肉",
  猪五花: "猪肉",
  鸡腿肉: "鸡肉",
  鸡胸肉: "鸡肉",
  鸡腿: "鸡肉",
  鸡翅: "鸡肉",
  鸡丁: "鸡肉",
  整鸡: "鸡肉",
  牛腩: "牛肉",
  牛排: "牛肉",
  牛里脊: "牛肉",
  羊腿: "羊肉",
  虾仁: "虾",
  对虾: "虾",
  基围虾: "虾",
  // 主食
  米饭: "米饭",
  剩米饭: "米饭",
  大米: "米饭",
  挂面: "面条",
  泡面: "面条",
  面线: "面条",
  方便面: "面条",
  // 蛋
  鸡蛋: "鸡蛋",
  土鸡蛋: "鸡蛋",
  鸭蛋: "鸡蛋",
  // 其他
  胡萝卜丝: "胡萝卜",
  胡萝卜片: "胡萝卜",
};

// 规范名 → 同义触发词集合（反向查表，便于「文本里出现任意一个就算命中」）
const REVERSE: Map<string, Set<string>> = (() => {
  const m = new Map<string, Set<string>>();
  // 自身也算同义词
  for (const [from, to] of Object.entries(RAW_ALIASES)) {
    if (!m.has(to)) m.set(to, new Set([to]));
    m.get(to)!.add(from);
  }
  return m;
})();

/** 把任意食材输入（含 qty 修饰、别名）规范化为标准名。空字符串返回空字符串。 */
export function normalizeIngredient(name: string): string {
  const trimmed = (name || "").trim();
  if (!trimmed) return "";
  // 完全等于别名 → 直接返回
  if (RAW_ALIASES[trimmed]) return RAW_ALIASES[trimmed];
  // 包含匹配：取最长匹配的别名
  let best: string | null = null;
  for (const k of Object.keys(RAW_ALIASES)) {
    if (trimmed.includes(k) && (!best || k.length > best.length)) best = k;
  }
  if (best) return RAW_ALIASES[best];
  return trimmed;
}

/** 给定规范名 a，给定文本 t，判断 t 是否包含 a 或其任意同义词。 */
export function textIncludesIngredient(text: string, target: string): boolean {
  if (!text || !target) return false;
  const norm = normalizeIngredient(target);
  if (!norm) return false;
  const triggers = REVERSE.get(norm) ?? new Set([norm]);
  let hit = false;
  triggers.forEach((t) => {
    if (!hit && text.includes(t)) hit = true;
  });
  if (hit) return true;
  // 兜底：用规范名直接匹配
  return text.includes(norm);
}

// 视为「调味 / 主食 / 油盐糖醋」的食材关键字 — 不参与冰箱命中率计算（默认家中常备），
// 但仍可作为家庭忌口匹配 source（如有人不吃花椒）。
const SEASONING_KEYWORDS = [
  "盐",
  "糖",
  "白糖",
  "冰糖",
  "酱油",
  "生抽",
  "老抽",
  "醋",
  "陈醋",
  "香醋",
  "料酒",
  "黄酒",
  "蚝油",
  "豆瓣酱",
  "蒜蓉酱",
  "甜面酱",
  "番茄酱",
  "辣椒酱",
  "辣椒油",
  "麻油",
  "香油",
  "食用油",
  "花椒",
  "八角",
  "桂皮",
  "香叶",
  "孜然",
  "白胡椒",
  "黑胡椒",
  "胡椒",
  "淀粉",
  "玉米淀粉",
  "面粉",
  "鸡精",
  "味精",
  "蜂蜜",
  "芝麻",
  "白芝麻",
  "黑芝麻",
  "辣椒粉",
  "五香粉",
];

/** 判断某 ingredient 是否仅是调味/底料 — 用于"差几样"统计时排除。 */
export function isSeasoning(name: string): boolean {
  const n = (name || "").trim();
  if (!n) return true;
  return SEASONING_KEYWORDS.some((s) => n === s || n.includes(s));
}

/** 是否是常见"家庭常备 / 默认有"食材，包括葱姜蒜油盐糖等。 */
export function isPantryStaple(name: string): boolean {
  const norm = normalizeIngredient(name);
  if (isSeasoning(norm)) return true;
  if (["葱", "姜", "蒜", "葱姜蒜"].includes(norm)) return true;
  return false;
}

/**
 * 从一条菜谱的 ingredients 中抽取「核心食材」标准名集合。
 *  - 已规范化（同义词合并）
 *  - 已剔除纯调味/家庭常备
 *  - 保留蔬菜 / 肉蛋豆制品 / 主食食材
 *
 * 主要用于：冰箱命中率计算 / 剩菜变形「冰箱里已有」标注 / 家庭忌口扫描。
 */
export function extractCoreIngredientNames(ings: Ingredient[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const i of ings) {
    const norm = normalizeIngredient(i.name);
    if (!norm) continue;
    if (isPantryStaple(norm)) continue;
    if (seen.has(norm)) continue;
    seen.add(norm);
    out.push(norm);
  }
  return out;
}

/** 把整道菜揉成一段大文本，用于"忌口/不喜欢"模糊匹配。 */
export function recipeSearchableText(opts: {
  name: string;
  ingredientNames: string[];
  tastes: string[];
  steps?: string[];
  reason?: string;
}): string {
  return [
    opts.name,
    ...opts.ingredientNames,
    ...(opts.tastes ?? []),
    ...(opts.steps ?? []),
    opts.reason ?? "",
  ]
    .join(" ")
    .toLowerCase();
}

// 常见忌口/食材的快捷标签（在家庭成员编辑、剩菜输入、冰箱预设中复用）。
export const COMMON_DISLIKE_TAGS: string[] = [
  "香菜",
  "苦瓜",
  "内脏",
  "香菇",
  "胡椒",
  "大蒜",
  "葱",
  "姜",
  "海鲜",
  "羊肉",
  "动物内脏",
  "辣椒",
  "花椒",
  "茄子",
  "韭菜",
];

export const COMMON_ALLERGEN_TAGS: string[] = [
  "花生",
  "坚果",
  "鸡蛋",
  "牛奶",
  "海鲜",
  "虾",
  "螃蟹",
  "贝类",
  "麸质",
  "大豆",
  "芒果",
];
