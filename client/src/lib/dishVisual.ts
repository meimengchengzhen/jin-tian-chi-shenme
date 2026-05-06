// 菜品可视化：根据 course/cuisine 生成稳定的渐变背景 + emoji 图标。
// 不依赖外部图片 / 网络，确保线上稳定展示。

import type { Course, Cuisine } from "@/data/recipes";

export interface DishVisual {
  /** 主背景渐变色（from→to） */
  gradient: [string, string];
  /** 副渐变色（用于卡片底部装饰条） */
  accent: string;
  /** 主 emoji */
  emoji: string;
  /** 次 emoji（小角标） */
  badge: string;
}

const COURSE_VISUAL: Record<Course, DishVisual> = {
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

/** 关键字命中：让特定菜品显示更贴近主食材的 emoji */
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

export function dishVisual(name: string, course: Course, cuisine: Cuisine): DishVisual {
  const base = COURSE_VISUAL[course];
  let emoji = base.emoji;
  for (const item of NAME_EMOJI) {
    if (item.keys.some((k) => name.includes(k))) {
      emoji = item.emoji;
      break;
    }
  }
  return {
    ...base,
    emoji,
    badge: CUISINE_EMOJI[cuisine] ?? base.badge,
  };
}

/** 根据菜名 + 关键字生成 Bilibili 搜索 URL（稳定，不依赖具体视频）。 */
export function videoSearchUrl(name: string, customQuery?: string): string {
  const q = customQuery?.trim() || `${name} 做法`;
  return `https://search.bilibili.com/all?keyword=${encodeURIComponent(q)}`;
}
