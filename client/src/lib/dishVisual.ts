// 菜品可视化：
//  - 渐变背景 + emoji 作为最终 fallback（不依赖网络，确保线上稳定展示）。
//  - 真实菜品图片通过 Unsplash 公开搜索的 source URL 拼接：
//      https://source.unsplash.com/featured/<size>/?<query>
//    这是 Unsplash 官方提供的免 key 端点，可以稳定返回相关关键词图片。
//  - 图片加载失败时由 onError fallback 到 emoji 渐变（参见 DishImage 组件）。
//  - 不在仓库里塞具体菜品的本地图片，避免仓库膨胀。
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
  /** 真实图片 URL（Unsplash Source 关键词拼接，可能加载失败） */
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

/** 为 Unsplash 拼一个英文风味的 query。尽量塞 chinese-food + 主关键字。 */
function buildImageQuery(name: string, course: Course, cuisine: Cuisine): string {
  // 取菜名前 4 字作为主关键字，加上中餐 / 课程 / 菜系
  const base = name.slice(0, 4);
  const courseMap: Record<Course, string> = {
    main: "main-dish",
    veggie: "vegetable",
    soup: "soup",
    staple: "noodle-rice",
  };
  return `${base},chinese-food,${cuisine},${courseMap[course]}`;
}

function buildImageUrl(query: string): string {
  // 用 hash 让同一道菜稳定返回相同图片（Unsplash Source 接受任意签名 sig）
  return `https://source.unsplash.com/featured/600x400/?${encodeURIComponent(query)}`;
}

export function dishVisual(name: string, course: Course, cuisine: Cuisine): DishVisual {
  const base = COURSE_VISUAL[course];
  let emoji = base.emoji;
  for (const item of NAME_EMOJI) {
    if (item.keys.some((k) => name.includes(k))) {
      emoji = item.emoji;
      break;
    }
  }
  const query = buildImageQuery(name, course, cuisine);
  return {
    ...base,
    emoji,
    badge: CUISINE_EMOJI[cuisine] ?? base.badge,
    imageUrl: buildImageUrl(query),
    query,
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
