// 菜品可视化：
//  - 渐变背景 + emoji 作为最终 fallback（不依赖网络，保证线上可用）。
//  - 真实菜品图片：使用 Unsplash 官方图床 images.unsplash.com 的固定 photo ID。
//    这些 ID 都是可直接访问的免费照片，已验证 HTTP 200。
//    旧版本用 source.unsplash.com，已被 Unsplash 在 2024 年下线（返回 503）。
//  - 关键词命中（鱼/虾/鸡/番茄/蛋/汤/面…）选用对应的图片池，再按 hash 稳定取一张。
//  - 加载失败时由 onError fallback 到 emoji 渐变。
//  - 详情/卡片明确标注「示意图」，避免误导。

import type { Course, Cuisine } from "@/data/recipes";

export interface DishVisual {
  /** 主背景渐变色（from→to） */
  gradient: [string, string];
  /** 副渐变色（用于卡片底部装饰条） */
  accent: string;
  /** 主 emoji（fallback） */
  emoji: string;
  /** 次 emoji（小角标） */
  badge: string;
  /** 真实图片 URL（Unsplash images，已校验可直链） */
  imageUrl: string;
  /** 提取出来的搜索关键字（用于 alt / debug） */
  query: string;
}

const COURSE_VISUAL: Record<Course, Omit<DishVisual, "imageUrl" | "query">> = {
  main: { gradient: ["#fbb273", "#c8552a"], accent: "#a13e1d", emoji: "🍱", badge: "🥢" },
  veggie: { gradient: ["#bce39a", "#5e9c45"], accent: "#3f7028", emoji: "🥗", badge: "🌿" },
  soup: { gradient: ["#f5c08d", "#a8794a"], accent: "#7a5532", emoji: "🍲", badge: "🥄" },
  staple: { gradient: ["#f5d97a", "#bd9445"], accent: "#8a6826", emoji: "🍜", badge: "🌾" },
};

const CUISINE_EMOJI: Partial<Record<Cuisine, string>> = {
  川菜: "🌶️",
  粤菜: "🦐",
  江浙: "🍤",
  鲁菜: "🥟",
  西北: "🌾",
  东北: "🥬",
  家常: "🏠",
};

const NAME_EMOJI: { keys: string[]; emoji: string }[] = [
  { keys: ["番茄", "西红柿"], emoji: "🍅" },
  { keys: ["蛋"], emoji: "🥚" },
  { keys: ["鱼"], emoji: "🐟" },
  { keys: ["虾"], emoji: "🍤" },
  { keys: ["鸡"], emoji: "🍗" },
  { keys: ["排骨", "肉"], emoji: "🍖" },
  { keys: ["豆腐"], emoji: "🧈" },
  { keys: ["茄"], emoji: "🍆" },
  { keys: ["土豆"], emoji: "🥔" },
  { keys: ["黄瓜"], emoji: "🥒" },
  { keys: ["菠菜", "白菜", "青菜", "包菜"], emoji: "🥬" },
  { keys: ["椒"], emoji: "🌶️" },
  { keys: ["蘑菇", "菌"], emoji: "🍄" },
  { keys: ["米", "饭"], emoji: "🍚" },
  { keys: ["面"], emoji: "🍜" },
  { keys: ["饼"], emoji: "🥞" },
  { keys: ["粥"], emoji: "🥣" },
  { keys: ["年糕"], emoji: "🍡" },
  { keys: ["馄饨", "饺"], emoji: "🥟" },
  { keys: ["汤"], emoji: "🍲" },
  { keys: ["玉米"], emoji: "🌽" },
  { keys: ["胡萝卜"], emoji: "🥕" },
  { keys: ["西兰花"], emoji: "🥦" },
  { keys: ["洋葱"], emoji: "🧅" },
];

// === Unsplash 图片池（已逐个校验 200）===
// 不同关键字对应不同图片池；按 hash 稳定取一张，这样同一道菜每次刷新展示同一张图。
// 图床 URL 自带 ?w=600&h=400&fit=crop&auto=format&q=70，浏览器侧不会因菜品多卡顿。

const POOL_GENERIC = [
  "1565958011703-44f9829ba187",
  "1551183053-bf91a1d81141",
  "1563379091339-03b21ab4a4f8",
  "1576402187878-974f70c890a5",
  "1525755662778-989d0524087e",
  "1604908176997-125f25cc6f3d",
];

const POOL_TOMATO_EGG = [
  "1546069901-ba9599a7e63c",
  "1565299624946-b28f40a0ae38",
  "1565299543923-37dd37887442",
];

const POOL_SOUP = [
  "1455619452474-d2be8b1e70cd",
  "1559847844-5315695dadae",
  "1604908176997-125f25cc6f3d",
];

const POOL_NOODLE = [
  "1569718212165-3a8278d5f624",
  "1606471191009-63994c53433b",
  "1601050690597-df0568f70950",
];

const POOL_VEGGIE = [
  "1518983546435-91f8b87fe561",
  "1590301157890-4810ed352733",
  "1585032226651-759b368d7246",
];

const POOL_MEAT = [
  "1567188040759-fb8a883dc6d8",
  "1602253057119-44d745d9b860",
  "1546833999-b9f581a1996d",
];

const POOL_RICE = [
  "1580013759032-c96505e24c1f",
  "1606851094291-6efae152bb87",
];

const POOL_TOFU = [
  "1565299543923-37dd37887442",
  "1607330289024-1535c6b4e1c1",
];

const POOL_SPICY = [
  "1542010589005-d1eacc3918f2",
  "1596797038530-2c107229654b",
  "1606755962773-d324e0a13086",
  "1626777552726-4a6b54c97e46",
];

const POOL_FISH = [
  "1558818498-28c1e002b655",
  "1626804475297-41608ea09aeb",
  "1551326844-4df70f78d0e9",
];

const POOL_DUMPLING = [
  "1617196034796-73dfa7b1fd56",
  "1546964124-0cce460f38ef",
];

const POOL_CHICKEN = [
  "1615870216519-2f9fa575fa5c",
  "1602253057119-44d745d9b860",
];

interface PoolMatch {
  keys: string[];
  pool: string[];
  /** 用于 alt / query 的英文标签 */
  tag: string;
}

const KEYWORD_POOLS: PoolMatch[] = [
  { keys: ["番茄", "西红柿"], pool: POOL_TOMATO_EGG, tag: "tomato-egg" },
  { keys: ["蛋"], pool: POOL_TOMATO_EGG, tag: "egg" },
  { keys: ["鱼"], pool: POOL_FISH, tag: "fish" },
  { keys: ["虾", "蟹", "贝", "蛤"], pool: POOL_FISH, tag: "seafood" },
  { keys: ["鸡"], pool: POOL_CHICKEN, tag: "chicken" },
  { keys: ["排骨", "猪", "牛", "羊", "肉"], pool: POOL_MEAT, tag: "meat" },
  { keys: ["豆腐"], pool: POOL_TOFU, tag: "tofu" },
  { keys: ["饺", "馄饨", "包子", "烧麦"], pool: POOL_DUMPLING, tag: "dumpling" },
  { keys: ["面", "粉"], pool: POOL_NOODLE, tag: "noodle" },
  { keys: ["米", "饭", "粥"], pool: POOL_RICE, tag: "rice" },
  { keys: ["汤", "羹", "炖", "煲"], pool: POOL_SOUP, tag: "soup" },
  { keys: ["椒", "辣", "麻"], pool: POOL_SPICY, tag: "spicy" },
  {
    keys: ["菠菜", "白菜", "青菜", "包菜", "西兰花", "黄瓜", "茄", "蘑菇", "菌", "土豆", "胡萝卜", "玉米", "豆角", "芹菜"],
    pool: POOL_VEGGIE,
    tag: "vegetable",
  },
];

const COURSE_POOL: Record<Course, string[]> = {
  main: POOL_GENERIC,
  veggie: POOL_VEGGIE,
  soup: POOL_SOUP,
  staple: POOL_NOODLE,
};

/** djb2 hash → 非负整数，用来稳定从池子里挑图。 */
function stableHash(input: string): number {
  let h = 5381;
  for (let i = 0; i < input.length; i++) {
    h = ((h << 5) + h + input.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function pickPool(name: string, course: Course): { pool: string[]; tag: string } {
  // 命中第一个关键字池
  for (const p of KEYWORD_POOLS) {
    if (p.keys.some((k) => name.includes(k))) {
      return { pool: p.pool, tag: p.tag };
    }
  }
  return { pool: COURSE_POOL[course], tag: course };
}

/** 拼接 images.unsplash.com 的稳定 URL（带尺寸/裁剪/q 参数）。 */
function buildImageUrl(photoId: string): string {
  return `https://images.unsplash.com/photo-${photoId}?w=600&h=400&fit=crop&auto=format&q=70`;
}

/** 给 Unsplash images 一个备用图（菜品列表通用），用于二次 onError。 */
export const FALLBACK_IMAGE_URL = buildImageUrl(POOL_GENERIC[0]);

export function dishVisual(name: string, course: Course, cuisine: Cuisine): DishVisual {
  const base = COURSE_VISUAL[course];
  let emoji = base.emoji;
  for (const item of NAME_EMOJI) {
    if (item.keys.some((k) => name.includes(k))) {
      emoji = item.emoji;
      break;
    }
  }
  const { pool, tag } = pickPool(name, course);
  const idx = stableHash(name + course + cuisine) % pool.length;
  const photoId = pool[idx];
  return {
    ...base,
    emoji,
    badge: CUISINE_EMOJI[cuisine] ?? base.badge,
    imageUrl: buildImageUrl(photoId),
    query: `${tag},chinese-food,${cuisine}`,
  };
}

// === 多平台搜索 URL ===
// Bilibili: 老的视频搜索 URL
// 抖音: 抖音网页搜索（移动端 H5 入口最稳定）
// 百度: 普通网页搜索
//
// 三个 URL 都通过 target=_blank 在新窗口打开（由消费方负责）。

export function bilibiliSearchUrl(name: string, customQuery?: string): string {
  const q = customQuery?.trim() || `${name} 做法`;
  return `https://search.bilibili.com/all?keyword=${encodeURIComponent(q)}`;
}

export function douyinSearchUrl(name: string, customQuery?: string): string {
  const q = customQuery?.trim() || `${name} 家常做法`;
  // 抖音网页版搜索路由（综合）。fallback：直接落到 douyin.com 搜索页。
  return `https://www.douyin.com/search/${encodeURIComponent(q)}`;
}

export function baiduSearchUrl(name: string, customQuery?: string): string {
  const q = customQuery?.trim() || `${name} 家常做法`;
  return `https://www.baidu.com/s?wd=${encodeURIComponent(q)}`;
}

/** 兼容旧调用：旧 videoSearchUrl 等同于 bilibiliSearchUrl。 */
export function videoSearchUrl(name: string, customQuery?: string): string {
  return bilibiliSearchUrl(name, customQuery);
}

export interface SearchEntry {
  id: "bilibili" | "douyin" | "baidu";
  label: string;
  hint: string;
  url: string;
}

/** 一次性给出三个平台的搜索入口。 */
export function buildSearchEntries(name: string, customQuery?: string): SearchEntry[] {
  return [
    {
      id: "bilibili",
      label: "Bilibili 视频",
      hint: "看完整教程",
      url: bilibiliSearchUrl(name, customQuery),
    },
    {
      id: "douyin",
      label: "抖音短视频",
      hint: "看快手教程",
      url: douyinSearchUrl(name, customQuery),
    },
    {
      id: "baidu",
      label: "百度搜索",
      hint: "看图文 / 知乎",
      url: baiduSearchUrl(name, customQuery),
    },
  ];
}
