// 真实菜品图片提供器（免费、无密钥、CORS 友好）：
//   1. Wikimedia Commons API（origin=*） — 中文 / 英文菜名搜索缩略图。
//   2. TheMealDB 公开接口（不需要 KEY，免费） — 国际通用菜 / 食材图片。
//   3. 命中失败或网络错误 → 返回 null，调用方 fallback 到 DishImage 渲染。
//
// 设计原则：
//   - 永远 best-effort，绝不破坏 UI；任何异常 catch 后返回 null。
//   - 命中结果缓存到 localStorage（24h），失败也缓存为 null（10min）以避免反复请求。
//   - localStorage 不可用时退回内存态。
//   - 图片仅作为「示意」覆盖在本地渲染氛围图上，加载失败 onError 立刻 fallback。

import { readJSON, writeJSON } from "./storage";

const CACHE_KEY = "chishenme.imageCache.v1";
const CACHE_HIT_TTL_MS = 24 * 60 * 60 * 1000; // 24h
const CACHE_MISS_TTL_MS = 10 * 60 * 1000; // 10min — 让用户隔一阵后能重新尝试
const MAX_CACHE_ENTRIES = 400;

interface CacheEntry {
  /** null = 命中过、但没找到合适的图 */
  url: string | null;
  /** 来源：wikimedia / themealdb / none */
  source: "wikimedia" | "themealdb" | "none";
  /** 命中时间戳 */
  ts: number;
}

type CacheMap = Record<string, CacheEntry>;

function loadCache(): CacheMap {
  return readJSON<CacheMap>(CACHE_KEY, {});
}

function saveCache(cache: CacheMap): void {
  // 简单 LRU：超过 MAX_CACHE_ENTRIES 时删除最旧 1/4
  const entries = Object.entries(cache);
  if (entries.length > MAX_CACHE_ENTRIES) {
    entries.sort((a, b) => a[1].ts - b[1].ts);
    const keep = entries.slice(Math.floor(MAX_CACHE_ENTRIES * 0.25));
    const next: CacheMap = {};
    for (const [k, v] of keep) next[k] = v;
    writeJSON(CACHE_KEY, next);
    return;
  }
  writeJSON(CACHE_KEY, cache);
}

function cacheGet(key: string): CacheEntry | null {
  const cache = loadCache();
  const entry = cache[key];
  if (!entry) return null;
  const ttl = entry.url === null ? CACHE_MISS_TTL_MS : CACHE_HIT_TTL_MS;
  if (Date.now() - entry.ts > ttl) return null;
  return entry;
}

function cacheSet(key: string, entry: CacheEntry): void {
  const cache = loadCache();
  cache[key] = entry;
  saveCache(cache);
}

// === Wikimedia Commons ===
// API 文档：https://commons.wikimedia.org/w/api.php
// origin=* 允许任意来源跨域；返回缩略图 URL。
async function tryWikimedia(query: string): Promise<string | null> {
  try {
    const url = new URL("https://commons.wikimedia.org/w/api.php");
    url.searchParams.set("action", "query");
    url.searchParams.set("format", "json");
    url.searchParams.set("origin", "*");
    url.searchParams.set("generator", "search");
    url.searchParams.set("gsrsearch", `${query} food`);
    url.searchParams.set("gsrlimit", "5");
    url.searchParams.set("gsrnamespace", "6"); // File:
    url.searchParams.set("prop", "imageinfo");
    url.searchParams.set("iiprop", "url|mime");
    url.searchParams.set("iiurlwidth", "320");

    const res = await fetch(url.toString(), { method: "GET" });
    if (!res.ok) return null;
    const data: any = await res.json();
    const pages = data?.query?.pages;
    if (!pages) return null;
    for (const id of Object.keys(pages)) {
      const p = pages[id];
      const ii = p?.imageinfo?.[0];
      if (!ii) continue;
      const mime: string = ii.mime ?? "";
      if (!/^image\/(jpeg|png|webp|gif)$/i.test(mime)) continue;
      const thumb = ii.thumburl || ii.url;
      if (typeof thumb === "string" && thumb.startsWith("https://")) {
        return thumb;
      }
    }
    return null;
  } catch {
    return null;
  }
}

// === TheMealDB ===
// 免费 API（test key "1"）— https://www.themealdb.com/api.php
// 主要用作国际菜 / 通用关键词的图片兜底（中文菜不一定命中）。
async function tryMealDb(query: string): Promise<string | null> {
  try {
    const url = `https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(query)}`;
    const res = await fetch(url, { method: "GET" });
    if (!res.ok) return null;
    const data: any = await res.json();
    const meals = data?.meals;
    if (!Array.isArray(meals) || meals.length === 0) return null;
    const first = meals[0];
    const thumb = first?.strMealThumb;
    if (typeof thumb === "string" && thumb.startsWith("https://")) return thumb;
    return null;
  } catch {
    return null;
  }
}

/** 中文菜名 → 英文/拼音查询关键词的简单映射（提高命中率）。
 *  没匹配到就直接用原名搜索（Wikimedia 也支持中文）。 */
const NAME_HINT: { keys: string[]; en: string }[] = [
  { keys: ["番茄炒蛋", "西红柿炒蛋"], en: "tomato scrambled egg" },
  { keys: ["宫保鸡丁"], en: "kung pao chicken" },
  { keys: ["麻婆豆腐"], en: "mapo tofu" },
  { keys: ["红烧肉"], en: "red braised pork belly" },
  { keys: ["回锅肉"], en: "twice cooked pork" },
  { keys: ["鱼香肉丝"], en: "yu xiang shredded pork" },
  { keys: ["可乐鸡翅"], en: "coca cola chicken wings" },
  { keys: ["糖醋排骨"], en: "sweet sour pork ribs" },
  { keys: ["糖醋里脊"], en: "sweet and sour pork" },
  { keys: ["炒饭", "蛋炒饭"], en: "fried rice" },
  { keys: ["扬州炒饭"], en: "yangzhou fried rice" },
  { keys: ["饺", "饺子", "锅贴"], en: "dumplings" },
  { keys: ["小笼包", "灌汤包"], en: "xiaolongbao" },
  { keys: ["包子"], en: "baozi" },
  { keys: ["馄饨", "云吞"], en: "wonton" },
  { keys: ["热干面"], en: "wuhan hot dry noodles" },
  { keys: ["担担面"], en: "dan dan noodles" },
  { keys: ["炸酱面"], en: "zhajiangmian noodles" },
  { keys: ["凉皮"], en: "liangpi cold skin noodles" },
  { keys: ["米线"], en: "rice noodles" },
  { keys: ["桂林米粉"], en: "guilin rice noodles" },
  { keys: ["螺蛳粉"], en: "luosifen rice noodle" },
  { keys: ["生煎"], en: "shengjian sheng jian bao" },
  { keys: ["烧麦"], en: "shaomai" },
  { keys: ["肠粉"], en: "rice noodle roll" },
  { keys: ["叉烧"], en: "char siu pork" },
  { keys: ["烤鸭", "北京烤鸭"], en: "peking duck" },
  { keys: ["白切鸡", "葱油白切鸡"], en: "white cut chicken" },
  { keys: ["小鸡炖蘑菇"], en: "chicken mushroom stew" },
  { keys: ["三杯鸡"], en: "three cup chicken" },
  { keys: ["口水鸡"], en: "saliva chicken" },
  { keys: ["盐焗鸡"], en: "salt baked chicken" },
  { keys: ["佛跳墙"], en: "buddha jumps over the wall" },
  { keys: ["东坡肉"], en: "dongpo pork" },
  { keys: ["毛血旺"], en: "mao xue wang" },
  { keys: ["水煮鱼", "酸菜鱼"], en: "boiled fish szechuan" },
  { keys: ["剁椒鱼头"], en: "chopped pepper fish head" },
  { keys: ["清蒸鲈鱼", "清蒸鱼"], en: "steamed fish cantonese" },
  { keys: ["糖油粑粑"], en: "sweet rice cake" },
  { keys: ["麻辣烫"], en: "malatang" },
  { keys: ["火锅"], en: "hot pot" },
  { keys: ["羊肉泡馍"], en: "yangrou paomo" },
  { keys: ["肉夹馍"], en: "rou jia mo chinese burger" },
  { keys: ["臊子面", "biangbiang面"], en: "biangbiang noodles" },
  { keys: ["奶茶"], en: "milk tea bubble" },
  { keys: ["豆浆"], en: "soy milk" },
  { keys: ["油条"], en: "youtiao" },
  { keys: ["煎饼", "煎饼果子"], en: "jianbing chinese crepe" },
  { keys: ["豆腐脑"], en: "douhua tofu pudding" },
  { keys: ["臭豆腐"], en: "stinky tofu" },
  { keys: ["铁板"], en: "sizzling beef plate" },
  { keys: ["饭", "焖饭"], en: "rice bowl" },
  { keys: ["拌面", "葱油拌面"], en: "scallion oil noodles" },
  { keys: ["蛋花汤", "番茄蛋花汤"], en: "egg drop soup" },
  { keys: ["排骨汤"], en: "pork rib soup" },
  { keys: ["紫菜汤", "紫菜虾皮汤"], en: "seaweed soup" },
];

function pickEnglishHint(name: string): string | null {
  for (const item of NAME_HINT) {
    if (item.keys.some((k) => name.includes(k))) return item.en;
  }
  return null;
}

export interface ImageResult {
  url: string;
  source: "wikimedia" | "themealdb";
}

/** 取菜品真实示意图。返回 null 表示未命中或失败 — 调用方 fallback。 */
export async function fetchDishImage(name: string): Promise<ImageResult | null> {
  if (!name || typeof fetch === "undefined") return null;
  const cacheKey = `dish::${name}`;
  const cached = cacheGet(cacheKey);
  if (cached) {
    if (cached.url && cached.source !== "none") {
      return { url: cached.url, source: cached.source as "wikimedia" | "themealdb" };
    }
    return null;
  }

  const enHint = pickEnglishHint(name);

  // 顺序尝试：Wikimedia(中文) → Wikimedia(英文) → TheMealDB(英文)
  const queries: { q: string; provider: "wikimedia" | "themealdb" }[] = [
    { q: name, provider: "wikimedia" },
  ];
  if (enHint) {
    queries.push({ q: enHint, provider: "wikimedia" });
    queries.push({ q: enHint, provider: "themealdb" });
  }

  for (const { q, provider } of queries) {
    let url: string | null = null;
    if (provider === "wikimedia") url = await tryWikimedia(q);
    else url = await tryMealDb(q);
    if (url) {
      cacheSet(cacheKey, { url, source: provider, ts: Date.now() });
      return { url, source: provider };
    }
  }

  cacheSet(cacheKey, { url: null, source: "none", ts: Date.now() });
  return null;
}

/** 清空整个图片缓存（暴露给设置面板，不在主 UI 调用）。 */
export function clearImageCache(): void {
  saveCache({});
}
