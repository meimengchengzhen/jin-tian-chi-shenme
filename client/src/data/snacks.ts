// 零食 / 饮料数据：常见超市 / 便利店 / 美团闪购可买。
// 字段含 大致热量 / 糖 / 脂肪 / 蛋白质 / 适合人群。这不是医疗建议。

export type SnackCategory =
  | "饮料"
  | "无糖饮料"
  | "薯片膨化"
  | "饼干曲奇"
  | "面包糕点"
  | "巧克力糖果"
  | "坚果"
  | "酸奶乳品"
  | "蛋白零食"
  | "肉脯肉干"
  | "果干蜜饯"
  | "速食冲泡"
  | "冰品冰淇淋";

export type SnackAudience =
  | "减脂"
  | "控糖"
  | "增肌"
  | "儿童"
  | "长辈"
  | "深夜"
  | "学生党"
  | "通勤"
  | "解压"
  | "朋友聚会";

export interface Snack {
  id: string;
  name: string;
  emoji: string;
  category: SnackCategory;
  /** 大致热量（每份） */
  calories: number;
  /** 大致糖（克） */
  sugar?: number;
  /** 脂肪（克） */
  fat?: number;
  /** 蛋白（克） */
  protein?: number;
  /** 单价大致 */
  price: string;
  /** 适合人群 */
  audiences: SnackAudience[];
  /** 一句话理由 */
  reason: string;
  /** 注意点 */
  caution?: string;
}

export const SNACKS: Snack[] = [
  // 饮料 — 含糖
  { id: "coke-can", name: "可口可乐 罐装 330ml", emoji: "🥤", category: "饮料", calories: 140, sugar: 35, price: "约 3 元",
    audiences: ["学生党", "通勤"], reason: "经典快乐肥宅水", caution: "含糖 35g，控糖 / 减脂请避开" },
  { id: "wanglao", name: "王老吉 凉茶", emoji: "🥤", category: "饮料", calories: 130, sugar: 30, price: "约 5 元",
    audiences: ["学生党"], reason: "传统凉茶，火锅烧烤标配", caution: "糖含量较高" },
  { id: "yuanqi-grape", name: "元气森林 葡萄味", emoji: "🥤", category: "无糖饮料", calories: 0, sugar: 0, price: "约 5 元",
    audiences: ["减脂", "控糖", "学生党"], reason: "0 糖 0 卡气泡水，减脂期不踩雷", caution: "代糖摄入过量也无益" },

  // 饮料 — 无糖 / 茶
  { id: "wahaha-water", name: "农夫山泉 矿泉水", emoji: "💧", category: "无糖饮料", calories: 0, sugar: 0, price: "约 2 元",
    audiences: ["减脂", "控糖", "通勤", "长辈", "儿童"], reason: "永远的标准答案" },
  { id: "tea-pi", name: "三得利 乌龙茶（无糖）", emoji: "🍵", category: "无糖饮料", calories: 0, sugar: 0, price: "约 6 元",
    audiences: ["减脂", "控糖", "通勤"], reason: "解腻无糖，吃烧烤火锅必备" },
  { id: "coke-zero", name: "可口可乐 零度", emoji: "🥤", category: "无糖饮料", calories: 0, sugar: 0, price: "约 3 元",
    audiences: ["减脂", "控糖", "学生党"], reason: "0 糖肥宅水，喝得心理安慰" },
  { id: "orange-juice", name: "汇源 100% 橙汁", emoji: "🧃", category: "饮料", calories: 110, sugar: 25, price: "约 6 元",
    audiences: ["儿童", "长辈"], reason: "VC 来源，但糖含量等同果糖", caution: "依然算「糖」，控糖者每次小份" },
  { id: "milk-pure", name: "光明纯牛奶 250ml", emoji: "🥛", category: "酸奶乳品", calories: 150, sugar: 12, fat: 8, protein: 8, price: "约 5 元",
    audiences: ["儿童", "长辈", "增肌"], reason: "蛋白质 8g，国民补钙首选", caution: "乳糖不耐者改舒化奶" },

  // 薯片膨化
  { id: "lays-original", name: "乐事 原味薯片 70g", emoji: "🥔", category: "薯片膨化", calories: 380, fat: 24, sugar: 1, price: "约 6 元",
    audiences: ["学生党", "解压"], reason: "经典追剧搭档", caution: "脂肪 24g，不要整袋干" },
  { id: "doritos", name: "多力多滋 玉米片 84g", emoji: "🌽", category: "薯片膨化", calories: 430, fat: 22, price: "约 8 元",
    audiences: ["朋友聚会", "学生党"], reason: "蘸沙拉酱聚会下午茶", caution: "重盐重油" },
  { id: "kelele", name: "可比克 烤翅味薯片", emoji: "🥔", category: "薯片膨化", calories: 360, fat: 21, price: "约 5 元",
    audiences: ["学生党"], reason: "便宜大份" },

  // 巧克力 / 糖果
  { id: "snickers", name: "士力架 51g", emoji: "🍫", category: "巧克力糖果", calories: 250, sugar: 25, fat: 12, protein: 4, price: "约 4 元",
    audiences: ["学生党", "通勤", "解压"], reason: "横扫饥饿做回自己", caution: "糖 + 脂肪 双高，控糖者避开" },
  { id: "ferrero", name: "费列罗 巧克力 3 粒", emoji: "🍫", category: "巧克力糖果", calories: 220, sugar: 19, fat: 16, price: "约 8 元",
    audiences: ["儿童", "解压"], reason: "情绪价值高，浓郁榛子" },
  { id: "dove-dark", name: "德芙黑巧 70%", emoji: "🍫", category: "巧克力糖果", calories: 170, sugar: 12, fat: 12, price: "约 8 元",
    audiences: ["控糖", "减脂", "通勤"], reason: "黑巧多酚，糖含量比奶巧低" },

  // 坚果
  { id: "shanya-mix", name: "三只松鼠 每日坚果 25g", emoji: "🥜", category: "坚果", calories: 165, fat: 13, protein: 5, price: "约 4 元",
    audiences: ["减脂", "控糖", "通勤", "增肌"], reason: "单果不饱和脂肪 + 维 E", caution: "坚果热量密度高，每天 1 包就够" },
  { id: "almonds", name: "巴旦木 50g", emoji: "🥜", category: "坚果", calories: 290, fat: 24, protein: 11, price: "约 9 元",
    audiences: ["增肌", "减脂", "控糖"], reason: "加餐扛饿，蛋白脂肪好" },
  { id: "walnut", name: "核桃 仁 30g", emoji: "🥥", category: "坚果", calories: 195, fat: 19, protein: 4, price: "约 7 元",
    audiences: ["长辈", "学生党"], reason: "ω-3 脂肪酸来源" },

  // 酸奶 / 乳品
  { id: "anjia-yogurt", name: "安佳无糖酸奶 100g", emoji: "🥄", category: "酸奶乳品", calories: 75, sugar: 5, fat: 3, protein: 4, price: "约 6 元",
    audiences: ["减脂", "控糖", "增肌", "长辈"], reason: "无糖、活菌、蛋白 4g", caution: "选「无糖」字样，避免「风味酸奶」" },
  { id: "chunzhen", name: "纯甄风味酸奶 200g", emoji: "🥛", category: "酸奶乳品", calories: 180, sugar: 22, fat: 6, protein: 6, price: "约 5 元",
    audiences: ["儿童", "学生党"], reason: "口味甜，孩子接受度高", caution: "糖 22g，不要当无糖喝" },
  { id: "simply-yogurt", name: "简爱 无糖原味酸奶 100g", emoji: "🥄", category: "酸奶乳品", calories: 70, sugar: 4, fat: 3, protein: 4, price: "约 7 元",
    audiences: ["减脂", "控糖", "增肌"], reason: "0 蔗糖，配料只有奶 + 菌" },
  { id: "milk-tea-pack", name: "三顿半 速溶咖啡", emoji: "☕", category: "速食冲泡", calories: 5, price: "约 9 元/颗",
    audiences: ["通勤", "学生党"], reason: "0 糖冷萃精品咖啡丸" },

  // 蛋白零食 / 即食
  { id: "ie-chicken", name: "鲨鱼菲特 即食鸡胸 100g", emoji: "🍗", category: "蛋白零食", calories: 130, fat: 2, protein: 25, price: "约 8 元",
    audiences: ["减脂", "增肌"], reason: "蛋白 25g，脂肪 2g，扛饿不增肥", caution: "钠含量略高，不要每天" },
  { id: "muscle-bar", name: "ffit8 蛋白棒", emoji: "🍫", category: "蛋白零食", calories: 175, sugar: 3, fat: 8, protein: 10, price: "约 12 元",
    audiences: ["减脂", "增肌", "通勤"], reason: "代餐扛饿，蛋白质 10g" },
  { id: "egg-jelly", name: "卤蛋（茶叶蛋）", emoji: "🥚", category: "蛋白零食", calories: 70, fat: 5, protein: 6, price: "约 2 元",
    audiences: ["减脂", "增肌", "通勤"], reason: "便利店常备，蛋白 6g 低糖低卡" },
  { id: "edamame-pack", name: "毛豆即食包 100g", emoji: "🌱", category: "蛋白零食", calories: 130, fat: 5, protein: 12, price: "约 6 元",
    audiences: ["减脂", "增肌", "解压"], reason: "蛋白 12g，碳水低，啤酒搭子也行" },

  // 面包 / 饼干
  { id: "soft-bread", name: "桃李软面包", emoji: "🍞", category: "面包糕点", calories: 200, sugar: 8, fat: 7, price: "约 4 元",
    audiences: ["学生党", "通勤", "儿童"], reason: "低糖软面包，早餐方便" },
  { id: "qb-cookie", name: "奇宝饼干 三明治夹心", emoji: "🍪", category: "饼干曲奇", calories: 230, sugar: 14, fat: 10, price: "约 5 元",
    audiences: ["学生党", "儿童"], reason: "下午茶常见", caution: "高糖高脂" },
  { id: "ouli-toast", name: "曼可顿吐司", emoji: "🍞", category: "面包糕点", calories: 280, sugar: 6, fat: 5, protein: 9, price: "约 12 元",
    audiences: ["通勤", "学生党"], reason: "蛋白 9g，三明治基底" },

  // 果干 / 肉脯
  { id: "raisin", name: "土耳其无核葡萄干 50g", emoji: "🍇", category: "果干蜜饯", calories: 150, sugar: 33, price: "约 5 元",
    audiences: ["儿童", "通勤"], reason: "天然甜，铁含量好", caution: "糖密度高，控糖小份" },
  { id: "beef-jerky", name: "靖江猪肉脯 50g", emoji: "🥩", category: "肉脯肉干", calories: 200, sugar: 12, fat: 6, protein: 18, price: "约 12 元",
    audiences: ["增肌", "通勤"], reason: "蛋白 18g，扛饿不踩雷" },
  { id: "duck-neck", name: "卤鸭脖（绝味/周黑鸭）", emoji: "🦆", category: "肉脯肉干", calories: 180, fat: 6, protein: 22, price: "约 18 元",
    audiences: ["朋友聚会", "解压"], reason: "啤酒搭子", caution: "钠含量高，不要每天" },
  { id: "dried-mango", name: "佳宝芒果干 60g", emoji: "🥭", category: "果干蜜饯", calories: 170, sugar: 32, price: "约 10 元",
    audiences: ["儿童", "学生党"], reason: "酸甜，浓缩果香", caution: "糖密度高于鲜果" },

  // 冰品 / 冲泡
  { id: "ice-cream-mengniu", name: "蒙牛随变 巧克力", emoji: "🍦", category: "冰品冰淇淋", calories: 180, sugar: 16, fat: 12, price: "约 5 元",
    audiences: ["儿童", "学生党", "解压"], reason: "经典冰品" },
  { id: "ice-zhongxue", name: "钟薛高 雪糕", emoji: "🍦", category: "冰品冰淇淋", calories: 230, sugar: 18, fat: 14, price: "约 18 元",
    audiences: ["朋友聚会"], reason: "网红雪糕，仪式感", caution: "高糖高脂" },
  { id: "instant-noodle", name: "康师傅红烧牛肉面", emoji: "🍜", category: "速食冲泡", calories: 510, fat: 20, protein: 10, price: "约 5 元",
    audiences: ["学生党", "深夜", "解压"], reason: "宿舍夜宵刚需", caution: "钠 / 油偏高" },
  { id: "instant-rice", name: "自热米饭（莫小仙）", emoji: "🍱", category: "速食冲泡", calories: 600, protein: 15, fat: 18, price: "约 18 元",
    audiences: ["通勤", "学生党", "深夜"], reason: "出差宿舍救命" },
];

export interface SnackPickInput {
  audiences: SnackAudience[];
  /** 限制最大热量（每份） */
  maxCalories?: number;
  /** 倾向类别 */
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
    // 受众匹配
    const aHits = input.audiences.filter((a) => s.audiences.includes(a)).length;
    score += aHits * 12;
    // 类别偏好
    if (input.preferCategories?.includes(s.category)) score += 10;
    // 热量上限：超过则降权
    if (input.maxCalories && s.calories > input.maxCalories) score -= 14;
    // 减脂 / 控糖：糖 / 脂肪 偏低加成
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
    // 随机扰动
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

/** 美团闪购 / 百度兜底搜索入口 */
export function snackSearchLinks(name: string): { label: string; href: string }[] {
  const q = encodeURIComponent(name);
  return [
    { label: "美团闪购搜", href: `https://i.meituan.com/awp/h5/search/result.html?q=${q}` },
    { label: "京东到家搜", href: `https://search.jd.com/Search?keyword=${q}` },
    { label: "淘宝搜", href: `https://s.taobao.com/search?q=${q}` },
    { label: "百度搜", href: `https://www.baidu.com/s?wd=${q}` },
  ];
}

