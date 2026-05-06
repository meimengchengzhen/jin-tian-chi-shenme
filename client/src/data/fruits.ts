// 时令水果数据（中国常见品种 / 大致月份覆盖）。
// 月份是粗略可用窗口，不是严格上市时间；中国南北跨度大，仅做引导。

export type FruitAudience =
  | "减脂"
  | "控糖"
  | "儿童"
  | "长辈"
  | "运动后"
  | "解馋"
  | "胃不适";

export type FruitTaste = "酸甜" | "甜" | "微酸" | "清爽" | "浓郁";

export interface Fruit {
  id: string;
  name: string;
  emoji: string;
  /** 月份覆盖（1-12） — 作为最佳购买窗口 */
  months: number[];
  /** 大致每 100g 热量 */
  calories: number;
  /** 大致糖（g/100g） */
  sugar: number;
  taste: FruitTaste[];
  /** 主要营养标签 */
  nutrition: string[];
  audiences: FruitAudience[];
  /** 简介 / 推荐理由 */
  reason: string;
  /** 注意事项（非医疗建议） */
  caution?: string;
}

export const FRUITS: Fruit[] = [
  // 1-2 月
  { id: "sugar-orange", name: "砂糖橘", emoji: "🍊", months: [11, 12, 1, 2], calories: 47, sugar: 9, taste: ["甜"],
    nutrition: ["VC", "膳食纤维"], audiences: ["儿童", "长辈", "解馋"], reason: "冬日水果担当，甜度高，剥皮方便", caution: "一次别超过 8 颗，糖分集中" },
  { id: "kumquat", name: "金桔", emoji: "🟡", months: [11, 12, 1, 2], calories: 71, sugar: 9, taste: ["酸甜"],
    nutrition: ["VC", "类黄酮"], audiences: ["长辈", "解馋"], reason: "皮薄连皮吃，开胃顺气" },
  { id: "buddha-melon", name: "佛手瓜", emoji: "🥒", months: [10, 11, 12, 1], calories: 27, sugar: 4, taste: ["清爽"],
    nutrition: ["膳食纤维"], audiences: ["减脂", "控糖"], reason: "热量极低，凉拌爽口", caution: "更像蔬菜" },
  { id: "guava-w", name: "番石榴（冬季）", emoji: "🟢", months: [11, 12, 1, 2], calories: 53, sugar: 9, taste: ["微酸"],
    nutrition: ["VC", "膳食纤维"], audiences: ["减脂", "控糖"], reason: "VC 含量超橙子，糖含量低" },
  { id: "kiwifruit", name: "猕猴桃", emoji: "🥝", months: [10, 11, 12, 1, 2, 3], calories: 61, sugar: 9, taste: ["酸甜"],
    nutrition: ["VC", "钾", "膳食纤维"], audiences: ["减脂", "运动后"], reason: "VC 之王，1 颗满足日需",
    caution: "胃不适者去硬芯，不要空腹大量吃" },

  // 3 月 早春
  { id: "strawberry", name: "草莓（旺季）", emoji: "🍓", months: [12, 1, 2, 3, 4, 5], calories: 32, sugar: 5, taste: ["酸甜"],
    nutrition: ["VC", "类黄酮"], audiences: ["儿童", "解馋", "减脂"], reason: "热量低甜度高，盆栽 / 鲜采都行",
    caution: "尽量去蒂清水浸泡几分钟" },
  { id: "tangelo", name: "丑橘 / 不知火", emoji: "🍊", months: [2, 3, 4], calories: 47, sugar: 11, taste: ["甜"],
    nutrition: ["VC"], audiences: ["儿童", "长辈"], reason: "皮丑肉甜，纤维粗水分足" },

  // 4-5 月
  { id: "loquat", name: "枇杷", emoji: "🍋", months: [4, 5, 6], calories: 39, sugar: 7, taste: ["酸甜"],
    nutrition: ["β-胡萝卜素", "钾"], audiences: ["长辈", "胃不适"], reason: "润喉清爽，初夏标志",
    caution: "果核有微毒不要吃" },
  { id: "cherry-cn", name: "国产樱桃 / 大樱桃", emoji: "🍒", months: [4, 5, 6], calories: 46, sugar: 11, taste: ["酸甜", "甜"],
    nutrition: ["铁", "VC"], audiences: ["儿童", "长辈", "解馋"], reason: "5 月最甜，铁含量好",
    caution: "去核给小朋友吃" },
  { id: "cherry-import", name: "进口车厘子", emoji: "🍒", months: [11, 12, 1, 2, 5, 6], calories: 50, sugar: 12, taste: ["甜"],
    nutrition: ["花青素", "钾"], audiences: ["解馋"], reason: "节庆水果，入口爆汁",
    caution: "糖含量较高，控糖一次不超过 200g" },
  { id: "lychee-early", name: "妃子笑荔枝（早季）", emoji: "🍈", months: [5, 6, 7], calories: 70, sugar: 15, taste: ["甜"],
    nutrition: ["VC", "钾"], audiences: ["解馋"], reason: "海南广东 5 月开始上市",
    caution: "一日不超过 10 颗，空腹 / 糖尿病慎食" },
  { id: "mango-early", name: "芒果（早季）", emoji: "🥭", months: [4, 5, 6, 7, 8, 9], calories: 60, sugar: 14, taste: ["甜"],
    nutrition: ["β-胡萝卜素", "VC"], audiences: ["儿童", "解馋"], reason: "5 月广西海南先到，香气浓郁",
    caution: "易过敏皮，吃完洗嘴" },
  { id: "strawberry-late", name: "草莓尾季", emoji: "🍓", months: [4, 5], calories: 32, sugar: 5, taste: ["酸甜"],
    nutrition: ["VC"], audiences: ["减脂", "儿童"], reason: "5 月旺季尾，价格走低，性价比窗口",
    caution: "尽量当天吃完" },
  { id: "pineapple", name: "菠萝", emoji: "🍍", months: [3, 4, 5, 6, 7], calories: 46, sugar: 9, taste: ["酸甜"],
    nutrition: ["菠萝酶", "VC"], audiences: ["减脂", "运动后"], reason: "解腻助消化",
    caution: "盐水泡 10 分钟避免刺口" },

  // 6-8 月 盛夏
  { id: "watermelon", name: "西瓜", emoji: "🍉", months: [5, 6, 7, 8, 9], calories: 30, sugar: 6, taste: ["甜", "清爽"],
    nutrition: ["水分", "番茄红素"], audiences: ["儿童", "长辈", "运动后", "解馋"], reason: "夏日水分担当",
    caution: "切开冷藏不超过 24h" },
  { id: "peach", name: "水蜜桃", emoji: "🍑", months: [6, 7, 8, 9], calories: 42, sugar: 8, taste: ["甜"],
    nutrition: ["膳食纤维", "VC"], audiences: ["儿童", "长辈", "解馋"], reason: "夏日蜜桃水分足" },
  { id: "blueberry", name: "蓝莓", emoji: "🫐", months: [5, 6, 7, 8, 9], calories: 57, sugar: 10, taste: ["微酸", "甜"],
    nutrition: ["花青素", "VC"], audiences: ["减脂", "控糖", "运动后"], reason: "花青素保护视力，糖密度低" },
  { id: "longan", name: "桂圆 / 龙眼", emoji: "🟤", months: [7, 8, 9], calories: 71, sugar: 16, taste: ["甜"],
    nutrition: ["VB", "钾"], audiences: ["长辈"], reason: "补气血，泡茶煲糖水",
    caution: "糖分高，控糖少吃" },
  { id: "grape", name: "葡萄 / 巨峰", emoji: "🍇", months: [7, 8, 9, 10], calories: 67, sugar: 16, taste: ["甜"],
    nutrition: ["白藜芦醇", "VC"], audiences: ["儿童", "解馋"], reason: "夏末葡萄串最甜",
    caution: "整粒别给小朋友" },
  { id: "fig", name: "无花果", emoji: "🟫", months: [7, 8, 9, 10], calories: 65, sugar: 15, taste: ["甜"],
    nutrition: ["膳食纤维", "钾"], audiences: ["长辈", "解馋"], reason: "鲜食或果干，膳食纤维高" },
  { id: "yangmei", name: "杨梅", emoji: "🔴", months: [5, 6, 7], calories: 28, sugar: 9, taste: ["酸甜"],
    nutrition: ["VC", "果酸"], audiences: ["解馋"], reason: "盛夏第一口酸甜",
    caution: "盐水泡 30 分钟，胃酸者少量" },

  // 9-11 月
  { id: "pomelo", name: "蜜柚", emoji: "🍈", months: [9, 10, 11, 12], calories: 41, sugar: 8, taste: ["微酸"],
    nutrition: ["VC"], audiences: ["减脂", "控糖", "长辈"], reason: "热量低，秋冬补 VC",
    caution: "服用部分降压药者询医生" },
  { id: "persimmon", name: "柿子", emoji: "🟧", months: [9, 10, 11, 12], calories: 71, sugar: 14, taste: ["甜"],
    nutrition: ["β-胡萝卜素", "钾"], audiences: ["儿童", "长辈"], reason: "秋天的甜",
    caution: "空腹 / 与高蛋白食物间隔吃" },
  { id: "apple", name: "苹果", emoji: "🍎", months: [9, 10, 11, 12, 1, 2, 3], calories: 52, sugar: 10, taste: ["酸甜", "甜"],
    nutrition: ["膳食纤维", "果胶"], audiences: ["减脂", "控糖", "儿童", "长辈"], reason: "全年压舱石",
    caution: "削皮还是带皮看农残处理" },
  { id: "pear", name: "梨", emoji: "🍐", months: [9, 10, 11, 12, 1], calories: 44, sugar: 9, taste: ["清爽", "甜"],
    nutrition: ["膳食纤维", "钾"], audiences: ["长辈", "胃不适"], reason: "润肺去燥，冰糖梨炖也好" },
  { id: "pomegranate", name: "石榴", emoji: "🟥", months: [9, 10, 11], calories: 72, sugar: 14, taste: ["酸甜"],
    nutrition: ["花青素", "VC"], audiences: ["长辈", "解馋"], reason: "秋天的红宝石",
    caution: "剥起来手会酸 — 切片浸水会更快" },
  { id: "hami-melon", name: "哈密瓜", emoji: "🍈", months: [6, 7, 8, 9, 10], calories: 34, sugar: 8, taste: ["甜"],
    nutrition: ["β-胡萝卜素", "钾"], audiences: ["儿童", "运动后", "解馋"], reason: "甜而不腻" },
  { id: "guava-s", name: "番石榴（秋）", emoji: "🟢", months: [8, 9, 10, 11], calories: 53, sugar: 9, taste: ["微酸"],
    nutrition: ["VC"], audiences: ["减脂", "控糖"], reason: "VC 之王，糖含量低" },

  // 全年压舱
  { id: "banana", name: "香蕉", emoji: "🍌", months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], calories: 89, sugar: 12, taste: ["甜"],
    nutrition: ["钾", "膳食纤维"], audiences: ["运动后", "长辈", "儿童"], reason: "运动前后扛饿、钾补充",
    caution: "热量较高，控糖每次半根" },
  { id: "orange", name: "橙子", emoji: "🍊", months: [11, 12, 1, 2, 3, 4, 5, 6], calories: 47, sugar: 9, taste: ["酸甜"],
    nutrition: ["VC", "果胶"], audiences: ["儿童", "长辈", "减脂"], reason: "全年好选择" },
  { id: "dragon-fruit", name: "火龙果", emoji: "🐉", months: [5, 6, 7, 8, 9, 10, 11], calories: 60, sugar: 8, taste: ["清爽", "甜"],
    nutrition: ["膳食纤维", "甜菜红素"], audiences: ["减脂", "控糖", "长辈"], reason: "膳食纤维丰富，热量适中",
    caution: "红心吃多尿色变红正常" },
  { id: "avocado", name: "牛油果", emoji: "🥑", months: [4, 5, 6, 7, 8, 9, 10, 11], calories: 160, sugar: 1, taste: ["浓郁"],
    nutrition: ["健康脂肪", "膳食纤维"], audiences: ["减脂", "控糖", "运动后"], reason: "好脂肪 + 高饱腹",
    caution: "热量高，每天半个就够" },
];

export interface FruitPickInput {
  /** 月份 1-12，默认当前 */
  month?: number;
  audiences: FruitAudience[];
  /** 是否优先在当月当令的水果 */
  seasonalOnly?: boolean;
}

export interface FruitPickResult {
  special: Fruit;
  alternatives: Fruit[];
  decisionLine: string;
  monthLabel: string;
  /** 当月「必吃 / 重点推荐」清单（已按编辑筛选并保证应季） */
  highlights: Fruit[];
}

/**
 * 各月「必吃」清单：编辑精选,会被推荐与首屏排序优先级最高
 * 选取标准:大众熟知的当月时令 / 早季 / 尾季关键词,5 月必含枇杷、樱桃、草莓尾季、荔枝早季、芒果。
 */
export const MONTH_HIGHLIGHTS: Record<number, string[]> = {
  1: ["sugar-orange", "kiwifruit", "guava-w", "apple"],
  2: ["sugar-orange", "tangelo", "kiwifruit", "apple"],
  3: ["strawberry", "tangelo", "pineapple", "kiwifruit"],
  4: ["loquat", "strawberry", "pineapple", "mango-early"],
  5: ["loquat", "cherry-cn", "strawberry-late", "lychee-early", "mango-early"],
  6: ["lychee-early", "watermelon", "peach", "yangmei", "loquat"],
  7: ["watermelon", "peach", "blueberry", "lychee-early", "grape"],
  8: ["watermelon", "grape", "longan", "peach", "fig"],
  9: ["grape", "pomegranate", "persimmon", "fig", "hami-melon"],
  10: ["persimmon", "apple", "pomegranate", "kiwifruit", "pomelo"],
  11: ["sugar-orange", "pomelo", "persimmon", "apple", "guava-s"],
  12: ["sugar-orange", "kiwifruit", "guava-w", "strawberry"],
};

export function highlightsForMonth(month: number): Fruit[] {
  const ids = MONTH_HIGHLIGHTS[month] ?? [];
  const map = new Map(FRUITS.map((f) => [f.id, f]));
  return ids.map((id) => map.get(id)).filter((f): f is Fruit => !!f);
}

export function pickFruit(input: FruitPickInput): FruitPickResult {
  const m = input.month ?? new Date().getMonth() + 1;
  const seasonal = FRUITS.filter((f) => f.months.includes(m));
  const pool = input.seasonalOnly ? seasonal : FRUITS;
  const highlightIds = new Set(MONTH_HIGHLIGHTS[m] ?? []);
  const noUserPrefs = input.audiences.length === 0;

  const scored = pool.map((f) => {
    let score = 0;
    if (f.months.includes(m)) score += 16;
    if (highlightIds.has(f.id)) {
      // 编辑精选优先,无用户偏好时尤其要保证它们排在前面
      score += noUserPrefs ? 14 : 8;
    }
    const aHits = input.audiences.filter((a) => f.audiences.includes(a)).length;
    score += aHits * 10;
    if (input.audiences.includes("控糖") && f.sugar > 12) score -= 8;
    if (input.audiences.includes("减脂") && f.calories > 80) score -= 6;
    score += Math.random() * 4;
    return { fruit: f, score };
  }).sort((a, b) => b.score - a.score);

  const special = scored[0].fruit;
  const alternatives = scored.slice(1, 6).map((s) => s.fruit);
  const highlights = highlightsForMonth(m).filter((f) => f.months.includes(m));
  const decisionLine = (() => {
    const tags = input.audiences.length > 0 ? input.audiences.join("·") : "应季当令";
    return `${m} 月替你决定：${special.name} — 适合「${tags}」`;
  })();
  return { special, alternatives, decisionLine, monthLabel: `${m} 月`, highlights };
}

export function fruitsForMonth(month: number): Fruit[] {
  return FRUITS.filter((f) => f.months.includes(month));
}
