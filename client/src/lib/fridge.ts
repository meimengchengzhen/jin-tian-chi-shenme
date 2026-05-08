// F2 — 冰箱有啥
// 数据：safe storage（沙箱安全）；保存若干 FridgeItem
// 推荐：基于现有菜谱 ingredients 做"命中率"计算，三档分组
//   ✅ 现在就能做：核心食材 ≥ 80%
//   🛒 再买一两样：50% – 79%
//   📋 还差挺多：< 50%
//
// 与个人 likes/dislikes、家庭成员评分协同：传入 boost/penalty hooks 由调用方提供。

import { readJSON, writeJSON } from "./storage";
import {
  normalizeIngredient,
  extractCoreIngredientNames,
  isPantryStaple,
} from "./ingredientAliases";
import type { Recipe } from "@/data/recipes";

export type FridgeQuantity = "trace" | "half" | "one" | "plenty";

export const QUANTITY_LABEL: Record<FridgeQuantity, string> = {
  trace: "少许",
  half: "半份",
  one: "一份",
  plenty: "很多",
};

export interface FridgeItem {
  id: string;
  /** 原始输入（保留给 UI 展示） */
  raw: string;
  /** 规范化名称（命中率计算用） */
  normalized: string;
  quantity: FridgeQuantity;
  addedAt: number;
}

const KEY = "fanda.fridge.items.v1";
const EVT = "fanda:fridge";

let cache: FridgeItem[] | null = null;

function load(): FridgeItem[] {
  if (cache) return cache;
  cache = readJSON<FridgeItem[]>(KEY, []);
  return cache!;
}

function persist(list: FridgeItem[]): void {
  cache = list;
  writeJSON(KEY, list);
  if (typeof window !== "undefined") {
    try {
      window.dispatchEvent(new CustomEvent(EVT));
    } catch {}
  }
}

export function listFridge(): FridgeItem[] {
  return [...load()];
}

export function subscribeFridge(cb: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const handler = () => cb();
  window.addEventListener(EVT, handler);
  return () => window.removeEventListener(EVT, handler);
}

function genId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    try {
      return crypto.randomUUID();
    } catch {
      // fallthrough
    }
  }
  return `fr_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

/** 添加食材：自动规范化 + 同名合并（保留较大数量）。 */
export function addFridgeItem(raw: string, quantity: FridgeQuantity = "one"): FridgeItem | null {
  const trimmed = (raw || "").trim();
  if (!trimmed) return null;
  const normalized = normalizeIngredient(trimmed);
  const list = load();
  const existing = list.find((it) => it.normalized === normalized);
  if (existing) {
    // 合并：保留较大数量
    const qOrder: FridgeQuantity[] = ["trace", "half", "one", "plenty"];
    const cur = qOrder.indexOf(existing.quantity);
    const incoming = qOrder.indexOf(quantity);
    const merged = qOrder[Math.max(cur, incoming)];
    persist(list.map((it) => (it.id === existing.id ? { ...it, quantity: merged, raw: trimmed } : it)));
    return { ...existing, quantity: merged, raw: trimmed };
  }
  const item: FridgeItem = {
    id: genId(),
    raw: trimmed,
    normalized,
    quantity,
    addedAt: Date.now(),
  };
  persist([...list, item]);
  return item;
}

export function updateFridgeItem(id: string, patch: Partial<FridgeItem>): void {
  const list = load();
  persist(list.map((it) => (it.id === id ? { ...it, ...patch } : it)));
}

export function removeFridgeItem(id: string): void {
  persist(load().filter((it) => it.id !== id));
}

export function clearFridge(): void {
  persist([]);
}

// ============== 推荐 ==============

export interface FridgeMatchResult {
  recipeId: string;
  /** 0–1，命中率（核心 + 重要辅料综合） */
  score: number;
  /** 命中食材（标准名） */
  matched: string[];
  /** 缺少食材（标准名，非调味/家常） */
  missing: string[];
  /** 用一句话说明 */
  reason: string;
  /** 分组 */
  bucket: "now" | "soon" | "later";
}

export function fridgeMatchScore(recipe: Recipe, fridge: FridgeItem[]): FridgeMatchResult {
  const have = new Set(fridge.map((f) => f.normalized));
  const core = extractCoreIngredientNames(recipe.ingredients);

  if (core.length === 0) {
    // 菜谱没有结构化的核心食材（多为甜品/饮品兜底），按比例给 0.5
    return {
      recipeId: recipe.id,
      score: have.size > 0 ? 0.5 : 0,
      matched: [],
      missing: [],
      reason: "没有可比对的核心食材",
      bucket: "later",
    };
  }

  const matched: string[] = [];
  const missing: string[] = [];
  for (const name of core) {
    if (have.has(name)) matched.push(name);
    else missing.push(name);
  }

  const score = matched.length / core.length;

  let bucket: FridgeMatchResult["bucket"];
  if (score >= 0.8) bucket = "now";
  else if (score >= 0.5) bucket = "soon";
  else bucket = "later";

  let reason: string;
  if (missing.length === 0) reason = "现有食材就够";
  else if (missing.length === 1) reason = `只差 ${missing[0]}`;
  else if (missing.length === 2) reason = `还差 ${missing.join("、")}`;
  else reason = `差 ${missing.length} 样`;

  return { recipeId: recipe.id, score, matched, missing, reason, bucket };
}

export interface FridgeRankedRecipe {
  recipe: Recipe;
  match: FridgeMatchResult;
}

export interface FridgeRankOptions {
  limit?: number;
  /** 调用方注入的额外加分（来自家庭兼容 / likes / personalize） */
  bonus?: (recipe: Recipe) => number;
  /** 完全过滤掉的菜（如硬过敏） */
  exclude?: (recipe: Recipe) => boolean;
}

export function rankByFridge(
  recipes: Recipe[],
  fridge: FridgeItem[],
  opts: FridgeRankOptions = {},
): FridgeRankedRecipe[] {
  const out: FridgeRankedRecipe[] = [];
  for (const r of recipes) {
    if (opts.exclude && opts.exclude(r)) continue;
    const m = fridgeMatchScore(r, fridge);
    out.push({ recipe: r, match: m });
  }
  out.sort((a, b) => {
    const sa = a.match.score + (opts.bonus ? opts.bonus(a.recipe) / 100 : 0);
    const sb = b.match.score + (opts.bonus ? opts.bonus(b.recipe) / 100 : 0);
    if (sb !== sa) return sb - sa;
    // 同分按用时短优先
    return a.recipe.timeMinutes - b.recipe.timeMinutes;
  });
  return opts.limit ? out.slice(0, opts.limit) : out;
}

export function groupByBucket(items: FridgeRankedRecipe[]): {
  now: FridgeRankedRecipe[];
  soon: FridgeRankedRecipe[];
  later: FridgeRankedRecipe[];
} {
  return {
    now: items.filter((x) => x.match.bucket === "now"),
    soon: items.filter((x) => x.match.bucket === "soon"),
    later: items.filter((x) => x.match.bucket === "later"),
  };
}

// 食材快速添加预设（按品类分组）
export const FRIDGE_PRESETS: { group: string; items: { label: string; emoji: string }[] }[] = [
  {
    group: "蛋白质",
    items: [
      { label: "鸡蛋", emoji: "🥚" },
      { label: "豆腐", emoji: "🧈" },
      { label: "猪肉", emoji: "🥩" },
      { label: "鸡肉", emoji: "🍗" },
      { label: "牛肉", emoji: "🥩" },
      { label: "虾", emoji: "🦐" },
      { label: "鱼", emoji: "🐟" },
      { label: "鸡胸肉", emoji: "🍗" },
    ],
  },
  {
    group: "蔬菜",
    items: [
      { label: "番茄", emoji: "🍅" },
      { label: "土豆", emoji: "🥔" },
      { label: "胡萝卜", emoji: "🥕" },
      { label: "青菜", emoji: "🥬" },
      { label: "白菜", emoji: "🥬" },
      { label: "黄瓜", emoji: "🥒" },
      { label: "茄子", emoji: "🍆" },
      { label: "西兰花", emoji: "🥦" },
      { label: "青椒", emoji: "🫑" },
      { label: "蘑菇", emoji: "🍄" },
    ],
  },
  {
    group: "主食",
    items: [
      { label: "米饭", emoji: "🍚" },
      { label: "面条", emoji: "🍜" },
      { label: "馒头", emoji: "🥟" },
      { label: "饺子皮", emoji: "🥟" },
    ],
  },
];

/** 把"还差几样"做成可加入到买菜清单的文本（每行一样，便于复制）。 */
export function missingToShoppingText(missing: string[], recipeName: string): string {
  return missing.map((m) => `${m}（做${recipeName}用）`).join("\n");
}

/** 是否"冰箱视为已有"该食材（已规范化或属常备）。 */
export function fridgeHas(fridge: FridgeItem[], rawName: string): boolean {
  const norm = normalizeIngredient(rawName);
  if (isPantryStaple(norm)) return true;
  return fridge.some((it) => it.normalized === norm);
}
