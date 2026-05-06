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
  ...buildExtraSnacks(),
];

// v2: 300+ 零食库 — 用真实常见品牌 + 品类规格模板补足，覆盖超市 / 便利店 / 美团闪购常见购物路径。
function buildExtraSnacks(): Snack[] {
  const tpls: Snack[] = [
    { id: "pepsi", name: "百事可乐 罐装 330ml", emoji: "🥤", category: "饮料", calories: 140, sugar: 35, price: "约 3 元", audiences: ["学生党"], reason: "经典快乐肥宅水", caution: "糖含量 35g" },
    { id: "fanta", name: "芬达 橙味 330ml", emoji: "🥤", category: "饮料", calories: 150, sugar: 38, price: "约 3 元", audiences: ["儿童", "学生党"], reason: "酸甜橙汽水", caution: "糖偏高" },
    { id: "sprite", name: "雪碧 330ml", emoji: "🥤", category: "饮料", calories: 140, sugar: 33, price: "约 3 元", audiences: ["学生党"], reason: "柠檬汽水解油", caution: "高糖" },
    { id: "qxq", name: "七喜 330ml", emoji: "🥤", category: "饮料", calories: 140, sugar: 33, price: "约 3 元", audiences: ["学生党"], reason: "柠檬味碳酸" },
    { id: "mirinda", name: "美年达 葡萄味", emoji: "🥤", category: "饮料", calories: 150, sugar: 38, price: "约 3 元", audiences: ["儿童"], reason: "葡萄汽水" },
    { id: "wanglao-gold", name: "加多宝 凉茶", emoji: "🥤", category: "饮料", calories: 130, sugar: 30, price: "约 5 元", audiences: ["学生党"], reason: "凉茶兄弟款" },
    { id: "yili-amx", name: "伊利 安慕希 200g", emoji: "🥛", category: "酸奶乳品", calories: 180, sugar: 22, fat: 6, protein: 6, price: "约 6 元", audiences: ["儿童"], reason: "希腊式风味酸奶", caution: "糖偏高" },
    { id: "yili-pure", name: "伊利纯牛奶 250ml", emoji: "🥛", category: "酸奶乳品", calories: 150, sugar: 12, fat: 8, protein: 8, price: "约 5 元", audiences: ["儿童", "长辈", "增肌"], reason: "国民补钙" },
    { id: "bright-pure", name: "光明纯牛奶 250ml", emoji: "🥛", category: "酸奶乳品", calories: 150, sugar: 12, fat: 8, protein: 8, price: "约 5 元", audiences: ["儿童", "长辈"], reason: "国民补钙" },
    { id: "shuhua", name: "蒙牛舒化奶 250ml", emoji: "🥛", category: "酸奶乳品", calories: 130, sugar: 5, fat: 5, protein: 7, price: "约 6 元", audiences: ["长辈", "增肌"], reason: "乳糖不耐者友好" },
    { id: "weiquan", name: "味全每日 C 橙汁", emoji: "🧃", category: "饮料", calories: 130, sugar: 28, price: "约 8 元", audiences: ["儿童"], reason: "鲜榨混合果汁", caution: "天然糖也是糖" },
    { id: "huiyuan-pulp", name: "汇源果粒橙", emoji: "🧃", category: "饮料", calories: 130, sugar: 27, price: "约 6 元", audiences: ["儿童"], reason: "国民橙汁", caution: "糖偏高" },
    { id: "yangle-juice", name: "养乐多 100ml", emoji: "🥤", category: "酸奶乳品", calories: 70, sugar: 15, fat: 0, protein: 1.2, price: "约 3 元", audiences: ["儿童"], reason: "肠道乳酸菌" },
    { id: "redbull", name: "红牛 250ml", emoji: "⚡", category: "饮料", calories: 110, sugar: 26, price: "约 6 元", audiences: ["通勤", "学生党"], reason: "提神功能饮料", caution: "晚上喝睡不着" },
    { id: "monster", name: "魔爪 能量饮料", emoji: "⚡", category: "饮料", calories: 50, sugar: 12, price: "约 7 元", audiences: ["通勤", "学生党"], reason: "提神超猛", caution: "心率快者慎喝" },
    { id: "gat", name: "佳得乐 600ml", emoji: "🏃", category: "饮料", calories: 130, sugar: 30, price: "约 6 元", audiences: ["通勤"], reason: "运动后补电解质", caution: "非运动场景含糖偏高" },
    { id: "pocari", name: "宝矿力水特", emoji: "🏃", category: "饮料", calories: 100, sugar: 25, price: "约 5 元", audiences: ["通勤"], reason: "运动补水离子" },
    { id: "vita-coco", name: "椰子水 Vita Coco", emoji: "🥥", category: "饮料", calories: 60, sugar: 13, price: "约 13 元", audiences: ["减脂"], reason: "天然椰子水补钾" },
    { id: "yuanqi-lemon", name: "元气森林 柠檬味", emoji: "🥤", category: "无糖饮料", calories: 0, sugar: 0, price: "约 5 元", audiences: ["减脂", "控糖"], reason: "0 糖气泡水" },
    { id: "yuanqi-peach", name: "元气森林 白桃味", emoji: "🥤", category: "无糖饮料", calories: 0, sugar: 0, price: "约 5 元", audiences: ["减脂", "控糖"], reason: "0 糖气泡水" },
    { id: "yuanqi-rou-gui", name: "元气森林 阴阳生酮", emoji: "🥤", category: "无糖饮料", calories: 0, sugar: 0, price: "约 5 元", audiences: ["减脂"], reason: "新口味气泡水" },
    { id: "ice-tea-pi", name: "三得利 茉莉花茶 无糖", emoji: "🍵", category: "无糖饮料", calories: 0, sugar: 0, price: "约 6 元", audiences: ["减脂", "控糖"], reason: "无糖茶国民款" },
    { id: "tea-dongfangshuye", name: "东方树叶 乌龙茶", emoji: "🍵", category: "无糖饮料", calories: 0, sugar: 0, price: "约 5 元", audiences: ["减脂", "控糖"], reason: "国民无糖茶" },
    { id: "tea-jasmine-dft", name: "东方树叶 茉莉茶", emoji: "🍵", category: "无糖饮料", calories: 0, sugar: 0, price: "约 5 元", audiences: ["减脂", "控糖"], reason: "无糖花茶" },
    { id: "perrier", name: "Perrier 矿泉气泡水", emoji: "💧", category: "无糖饮料", calories: 0, sugar: 0, price: "约 8 元", audiences: ["减脂", "控糖"], reason: "天然气泡矿泉水" },
    { id: "evian", name: "依云矿泉水 500ml", emoji: "💧", category: "无糖饮料", calories: 0, sugar: 0, price: "约 8 元", audiences: ["长辈"], reason: "进口矿泉" },
    { id: "kkvitalcoffee", name: "雀巢丝滑拿铁 罐装", emoji: "☕", category: "速食冲泡", calories: 110, sugar: 13, price: "约 7 元", audiences: ["通勤"], reason: "便利店即拆即喝" },
    { id: "bottle-coffee-suntory", name: "三得利 BOSS 咖啡", emoji: "☕", category: "饮料", calories: 90, sugar: 10, price: "约 8 元", audiences: ["通勤"], reason: "日式即饮咖啡" },
    { id: "bottle-coffee-coke", name: "雪伊森林 咖啡", emoji: "☕", category: "饮料", calories: 80, sugar: 9, price: "约 7 元", audiences: ["通勤"], reason: "罐装拿铁" },
    { id: "lays-cucumber", name: "乐事 黄瓜味薯片 70g", emoji: "🥒", category: "薯片膨化", calories: 360, fat: 22, sugar: 1, price: "约 6 元", audiences: ["学生党"], reason: "黄瓜味薯片网红款", caution: "高油" },
    { id: "lays-rosemary", name: "乐事 迷迭香味", emoji: "🥔", category: "薯片膨化", calories: 380, fat: 24, sugar: 1, price: "约 6 元", audiences: ["学生党"], reason: "西式风味" },
    { id: "lays-bbq", name: "乐事 烤肉味", emoji: "🥩", category: "薯片膨化", calories: 380, fat: 23, sugar: 1, price: "约 6 元", audiences: ["学生党"], reason: "烤肉烟熏味" },
    { id: "yelloworcorn", name: "上好佳 玉米锥", emoji: "🌽", category: "薯片膨化", calories: 320, fat: 18, sugar: 4, price: "约 5 元", audiences: ["学生党"], reason: "童年膨化记忆" },
    { id: "kris-potato", name: "Kris 薯片 大袋", emoji: "🥔", category: "薯片膨化", calories: 410, fat: 24, sugar: 2, price: "约 12 元", audiences: ["朋友聚会"], reason: "聚会大袋", caution: "热量高" },
    { id: "pringles-original", name: "品客 原味薯片", emoji: "🥔", category: "薯片膨化", calories: 400, fat: 24, sugar: 1, price: "约 12 元", audiences: ["朋友聚会"], reason: "罐装薯片不易碎" },
    { id: "pringles-spicy", name: "品客 香辣味", emoji: "🌶️", category: "薯片膨化", calories: 400, fat: 24, sugar: 1, price: "约 12 元", audiences: ["朋友聚会"], reason: "香辣口" },
    { id: "shrimp-cracker", name: "卡乐比 虾条", emoji: "🦐", category: "薯片膨化", calories: 320, fat: 18, sugar: 2, price: "约 8 元", audiences: ["儿童"], reason: "童年虾条" },
    { id: "honey-stick", name: "卡乐比 甜薯条", emoji: "🍠", category: "薯片膨化", calories: 380, fat: 18, sugar: 18, price: "约 8 元", audiences: ["儿童"], reason: "焦糖薯条" },
    { id: "calbee-veg", name: "卡乐比 蔬菜薯条", emoji: "🥕", category: "薯片膨化", calories: 320, fat: 16, price: "约 8 元", audiences: ["儿童"], reason: "蔬菜风味薯条" },
    { id: "rice-crisp-sasa", name: "三幸 米果", emoji: "🍘", category: "薯片膨化", calories: 280, fat: 12, sugar: 4, price: "约 8 元", audiences: ["儿童", "长辈"], reason: "日式米果" },
    { id: "wang-corn", name: "旺旺 仙贝", emoji: "🍘", category: "薯片膨化", calories: 280, fat: 11, sugar: 5, price: "约 8 元", audiences: ["儿童", "长辈"], reason: "童年米饼" },
    { id: "wang-rice-crackers", name: "旺旺 雪饼", emoji: "🍘", category: "薯片膨化", calories: 280, fat: 10, sugar: 8, price: "约 8 元", audiences: ["儿童"], reason: "甜咸雪饼" },
    { id: "qq-egg-roll", name: "万花筒 蛋卷", emoji: "🥯", category: "饼干曲奇", calories: 350, fat: 18, sugar: 14, price: "约 14 元", audiences: ["长辈", "学生党"], reason: "鸡蛋香酥蛋卷" },
    { id: "wuzhi", name: "五芳斋 粽子 1 个", emoji: "🍙", category: "速食冲泡", calories: 320, fat: 6, sugar: 12, price: "约 8 元", audiences: ["儿童", "长辈"], reason: "端午限定" },
    { id: "kitkat", name: "KitKat 威化巧克力", emoji: "🍫", category: "巧克力糖果", calories: 230, sugar: 22, fat: 12, price: "约 6 元", audiences: ["儿童"], reason: "招牌威化" },
    { id: "mars-bar", name: "玛氏 Mars Bar", emoji: "🍫", category: "巧克力糖果", calories: 250, sugar: 30, fat: 10, price: "约 6 元", audiences: ["学生党"], reason: "焦糖巧克力" },
    { id: "twix", name: "Twix 巧克力", emoji: "🍫", category: "巧克力糖果", calories: 250, sugar: 24, fat: 12, price: "约 6 元", audiences: ["学生党"], reason: "饼干 + 焦糖" },
    { id: "milky-way", name: "Milky Way", emoji: "🍫", category: "巧克力糖果", calories: 230, sugar: 30, fat: 8, price: "约 6 元", audiences: ["儿童"], reason: "牛奶巧克力" },
    { id: "ferrero-rocher-12", name: "费列罗 12 粒装", emoji: "🍫", category: "巧克力糖果", calories: 880, sugar: 76, fat: 64, price: "约 60 元", audiences: ["朋友聚会"], reason: "送礼送好" },
    { id: "lindor", name: "Lindor 软心巧克力", emoji: "🍫", category: "巧克力糖果", calories: 75, sugar: 6, fat: 6, price: "约 6 元/颗", audiences: ["解压"], reason: "瑞士软心巧克力" },
    { id: "dove-milk", name: "德芙 牛奶巧克力", emoji: "🍫", category: "巧克力糖果", calories: 200, sugar: 22, fat: 12, price: "约 6 元", audiences: ["儿童"], reason: "丝滑牛奶巧" },
    { id: "snickers-mini", name: "士力架 小颗装", emoji: "🍫", category: "巧克力糖果", calories: 80, sugar: 9, fat: 4, protein: 1.5, price: "约 2 元", audiences: ["学生党"], reason: "便携小条" },
    { id: "mentos-mint", name: "曼妥思 薄荷糖", emoji: "🍬", category: "巧克力糖果", calories: 150, sugar: 36, price: "约 4 元", audiences: ["通勤"], reason: "饭后清新" },
    { id: "extra-gum", name: "益达无糖口香糖", emoji: "🌿", category: "巧克力糖果", calories: 5, sugar: 0, price: "约 8 元", audiences: ["通勤", "控糖"], reason: "无糖口香糖" },
    { id: "lollipop-chupa", name: "珍宝珠 棒棒糖", emoji: "🍭", category: "巧克力糖果", calories: 60, sugar: 12, price: "约 1 元", audiences: ["儿童"], reason: "童年棒棒糖" },
    { id: "alpenliebe", name: "阿尔卑斯 棒棒糖", emoji: "🍭", category: "巧克力糖果", calories: 55, sugar: 13, price: "约 1.5 元", audiences: ["儿童"], reason: "童年甜糖" },
    { id: "haribo-bear", name: "Haribo 小熊软糖", emoji: "🐻", category: "巧克力糖果", calories: 90, sugar: 22, price: "约 8 元", audiences: ["儿童"], reason: "进口软糖" },
    { id: "skittles", name: "彩虹糖 Skittles", emoji: "🌈", category: "巧克力糖果", calories: 250, sugar: 60, price: "约 5 元", audiences: ["儿童"], reason: "酸甜豆豆糖" },
    { id: "mm-peanut", name: "M&M 花生豆", emoji: "🥜", category: "巧克力糖果", calories: 220, sugar: 22, fat: 12, protein: 4, price: "约 7 元", audiences: ["学生党"], reason: "花生牛奶豆" },
    { id: "qiaqia-sunflower", name: "洽洽 香瓜子 250g", emoji: "🌻", category: "坚果", calories: 580, fat: 50, protein: 18, price: "约 12 元", audiences: ["朋友聚会", "长辈"], reason: "国民瓜子", caution: "整袋热量爆表" },
    { id: "qiaqia-blue", name: "洽洽 蓝袋瓜子", emoji: "🌻", category: "坚果", calories: 580, fat: 50, protein: 18, price: "约 13 元", audiences: ["朋友聚会"], reason: "焦糖瓜子" },
    { id: "songshu-mix-50", name: "三只松鼠 每日坚果 50g", emoji: "🥜", category: "坚果", calories: 320, fat: 24, protein: 9, price: "约 7 元", audiences: ["减脂", "控糖"], reason: "混合每日坚果" },
    { id: "songshu-mix-30", name: "三只松鼠 每日坚果 30g", emoji: "🥜", category: "坚果", calories: 195, fat: 15, protein: 5.5, price: "约 5 元", audiences: ["减脂", "通勤"], reason: "每日 1 包刚好" },
    { id: "baicao-mix", name: "百草味 每日坚果 25g", emoji: "🥜", category: "坚果", calories: 165, fat: 13, protein: 5, price: "约 4 元", audiences: ["减脂"], reason: "便宜版坚果包" },
    { id: "haoxiangni-jujube", name: "好想你 红枣", emoji: "🟥", category: "果干蜜饯", calories: 270, sugar: 60, price: "约 18 元", audiences: ["长辈"], reason: "新疆若羌枣" },
    { id: "macadamia", name: "夏威夷果 100g", emoji: "🥥", category: "坚果", calories: 720, fat: 76, protein: 8, price: "约 28 元", audiences: ["增肌", "减脂"], reason: "高脂坚果" },
    { id: "cashew", name: "腰果 100g", emoji: "🥜", category: "坚果", calories: 560, fat: 44, protein: 18, price: "约 18 元", audiences: ["增肌"], reason: "腰果蛋白脂肪好" },
    { id: "pistachio", name: "开心果 50g", emoji: "🟢", category: "坚果", calories: 290, fat: 22, protein: 10, price: "约 13 元", audiences: ["增肌", "减脂"], reason: "开心果好脂肪" },
    { id: "pumpkin-seed", name: "南瓜子 50g", emoji: "🎃", category: "坚果", calories: 270, fat: 22, protein: 13, price: "约 8 元", audiences: ["增肌"], reason: "南瓜子蛋白" },
    { id: "almonds-roast", name: "巴旦木 烤香 100g", emoji: "🥜", category: "坚果", calories: 580, fat: 48, protein: 22, price: "约 22 元", audiences: ["增肌", "减脂"], reason: "原味烤巴旦木" },
    { id: "walnut-shell", name: "纸皮核桃 200g", emoji: "🥥", category: "坚果", calories: 1300, fat: 130, protein: 28, price: "约 22 元", audiences: ["长辈"], reason: "现剥纸皮核桃" },
    { id: "lotus-seed-dry", name: "干莲子 100g", emoji: "🟫", category: "坚果", calories: 350, fat: 1.5, protein: 18, price: "约 18 元", audiences: ["长辈"], reason: "煲汤补品" },
    { id: "anjia-low", name: "安佳 低脂奶 250ml", emoji: "🥛", category: "酸奶乳品", calories: 100, sugar: 11, fat: 1.5, protein: 8, price: "约 8 元", audiences: ["减脂", "增肌"], reason: "低脂高蛋白" },
    { id: "yili-greek", name: "伊利 希腊酸奶 100g", emoji: "🥄", category: "酸奶乳品", calories: 130, sugar: 10, fat: 6, protein: 8, price: "约 7 元", audiences: ["增肌"], reason: "希腊酸奶蛋白翻倍" },
    { id: "lehe", name: "乐荷 燕麦酸奶", emoji: "🥄", category: "酸奶乳品", calories: 150, sugar: 14, fat: 3, protein: 5, price: "约 7 元", audiences: ["儿童"], reason: "燕麦风味" },
    { id: "junlebao-yogurt", name: "君乐宝 简醇 0 蔗糖", emoji: "🥄", category: "酸奶乳品", calories: 75, sugar: 4, fat: 3, protein: 4, price: "约 5 元", audiences: ["减脂", "控糖"], reason: "0 蔗糖酸奶" },
    { id: "jianai-grape", name: "简爱 葡萄酸奶", emoji: "🍇", category: "酸奶乳品", calories: 90, sugar: 8, fat: 3, protein: 4, price: "约 8 元", audiences: ["减脂"], reason: "果味酸奶低糖" },
    { id: "kiri-cheese", name: "Kiri 奶酪小三角", emoji: "🧀", category: "酸奶乳品", calories: 60, sugar: 1, fat: 5, protein: 2, price: "约 4 元/块", audiences: ["儿童"], reason: "便携奶酪" },
    { id: "miaokelando-rod", name: "妙可蓝多 奶酪棒", emoji: "🧀", category: "酸奶乳品", calories: 80, sugar: 5, fat: 5, protein: 4, price: "约 5 元/根", audiences: ["儿童"], reason: "儿童奶酪棒" },
    { id: "soybean-milk", name: "豆本豆 唯甄豆奶 250ml", emoji: "🥛", category: "酸奶乳品", calories: 90, sugar: 5, fat: 3, protein: 6, price: "约 4 元", audiences: ["减脂", "控糖"], reason: "植物奶" },
    { id: "almond-milk", name: "维他奶 杏仁奶 250ml", emoji: "🥛", category: "酸奶乳品", calories: 50, sugar: 3, fat: 2, price: "约 6 元", audiences: ["减脂"], reason: "低卡植物奶" },
    { id: "oat-milk", name: "OATLY 燕麦奶 250ml", emoji: "🥛", category: "酸奶乳品", calories: 120, sugar: 7, fat: 2, protein: 1, price: "约 9 元", audiences: ["减脂"], reason: "咖啡好搭子" },
    { id: "egg-tea", name: "茶叶蛋 1 个", emoji: "🥚", category: "蛋白零食", calories: 70, fat: 5, protein: 6, price: "约 2 元", audiences: ["减脂"], reason: "便利店刚需" },
    { id: "egg-marble", name: "卤蛋（鹅蛋）", emoji: "🥚", category: "蛋白零食", calories: 100, fat: 7, protein: 8, price: "约 5 元", audiences: ["增肌"], reason: "卤香" },
    { id: "chicken-breast-grilled", name: "蜀道香 卤鸡胸 100g", emoji: "🍗", category: "蛋白零食", calories: 120, fat: 2, protein: 24, price: "约 9 元", audiences: ["减脂", "增肌"], reason: "高蛋白即食" },
    { id: "ffit-bar-choco", name: "ffit8 巧克力蛋白棒", emoji: "🍫", category: "蛋白零食", calories: 165, sugar: 4, fat: 7, protein: 10, price: "约 12 元", audiences: ["减脂", "增肌"], reason: "代餐棒巧克力" },
    { id: "myprotein-bar", name: "MyProtein 蛋白棒", emoji: "🍫", category: "蛋白零食", calories: 200, sugar: 5, fat: 7, protein: 18, price: "约 18 元", audiences: ["增肌"], reason: "进口高蛋白棒" },
    { id: "fish-floss-jerky", name: "海苔肉松条", emoji: "🍙", category: "蛋白零食", calories: 110, fat: 4, protein: 10, price: "约 6 元", audiences: ["儿童"], reason: "海苔肉松" },
    { id: "tofu-jerky", name: "豆腐干 100g", emoji: "🟫", category: "蛋白零食", calories: 200, fat: 9, protein: 17, price: "约 6 元", audiences: ["增肌", "减脂"], reason: "素食蛋白" },
    { id: "duck-tongue", name: "周黑鸭 鸭舌", emoji: "🦆", category: "肉脯肉干", calories: 250, fat: 14, protein: 22, price: "约 28 元", audiences: ["朋友聚会"], reason: "卤味重口" },
    { id: "duck-feet", name: "周黑鸭 鸭爪", emoji: "🦆", category: "肉脯肉干", calories: 200, fat: 12, protein: 18, price: "约 22 元", audiences: ["朋友聚会"], reason: "卤鸭爪啃啃" },
    { id: "edamame-frozen", name: "冷冻毛豆", emoji: "🌱", category: "蛋白零食", calories: 130, fat: 5, protein: 12, price: "约 5 元", audiences: ["减脂", "增肌"], reason: "微波 3 分钟" },
    { id: "ham-sausage", name: "双汇 王中王火腿肠", emoji: "🌭", category: "肉脯肉干", calories: 260, fat: 18, protein: 13, price: "约 3 元", audiences: ["学生党"], reason: "国民火腿肠", caution: "钠/添加剂" },
    { id: "shuanghui-ham", name: "双汇 玉米热狗肠", emoji: "🌭", category: "肉脯肉干", calories: 250, fat: 16, protein: 12, price: "约 3 元", audiences: ["学生党"], reason: "玉米味火腿" },
    { id: "ferrero-cookie", name: "好丽友 巧克力派", emoji: "🍩", category: "饼干曲奇", calories: 150, sugar: 12, fat: 8, price: "约 2 元/个", audiences: ["儿童", "学生党"], reason: "经典奶香派" },
    { id: "haoliyou-fudge", name: "好丽友 蛋黄派", emoji: "🥚", category: "面包糕点", calories: 145, sugar: 14, fat: 7, price: "约 2 元", audiences: ["儿童", "学生党"], reason: "童年记忆" },
    { id: "leiye-crisp", name: "雷氏 蛋黄酥", emoji: "🥮", category: "面包糕点", calories: 280, sugar: 12, fat: 16, price: "约 8 元", audiences: ["长辈"], reason: "酥皮蛋黄" },
    { id: "tory-suncake", name: "佳德 凤梨酥", emoji: "🍍", category: "面包糕点", calories: 150, sugar: 12, fat: 6, price: "约 7 元/个", audiences: ["朋友聚会"], reason: "台式凤梨酥" },
    { id: "moon-cake-cantonese", name: "广式月饼 1 个", emoji: "🥮", category: "面包糕点", calories: 350, sugar: 30, fat: 16, price: "约 9 元", audiences: ["长辈"], reason: "中秋限定" },
    { id: "egg-tart", name: "葡式蛋挞", emoji: "🥧", category: "面包糕点", calories: 150, sugar: 11, fat: 9, price: "约 7 元", audiences: ["儿童"], reason: "酥皮蛋挞" },
    { id: "mille-feuille", name: "千层蛋糕 1 块", emoji: "🍰", category: "面包糕点", calories: 320, sugar: 22, fat: 18, price: "约 22 元", audiences: ["朋友聚会"], reason: "下午茶蛋糕" },
    { id: "swiss-roll", name: "瑞士卷 1 块", emoji: "🍰", category: "面包糕点", calories: 280, sugar: 20, fat: 15, price: "约 8 元", audiences: ["儿童"], reason: "奶油卷" },
    { id: "biscuits-oreo", name: "奥利奥 经典原味", emoji: "🍪", category: "饼干曲奇", calories: 160, sugar: 12, fat: 7, price: "约 8 元", audiences: ["学生党"], reason: "扭一扭舔一舔" },
    { id: "biscuits-pocky", name: "格力高 Pocky", emoji: "🍪", category: "饼干曲奇", calories: 180, sugar: 14, fat: 8, price: "约 10 元", audiences: ["儿童"], reason: "巧克力涂层棒" },
    { id: "wangwang-soft-rice", name: "旺旺 雪米饼", emoji: "🍘", category: "饼干曲奇", calories: 280, fat: 12, sugar: 6, price: "约 10 元", audiences: ["儿童"], reason: "雪米饼经典" },
    { id: "kinder-egg", name: "费列罗 健达奇趣蛋", emoji: "🥚", category: "巧克力糖果", calories: 220, sugar: 18, fat: 12, price: "约 7 元", audiences: ["儿童"], reason: "童年惊喜蛋" },
    { id: "rilakkuma", name: "格力高 百醇千层", emoji: "🍪", category: "饼干曲奇", calories: 200, sugar: 16, fat: 8, price: "约 12 元", audiences: ["儿童"], reason: "盒装小棒" },
    { id: "mochi-glutinous", name: "麻薯 / 大福", emoji: "🍡", category: "面包糕点", calories: 160, sugar: 13, fat: 4, price: "约 5 元", audiences: ["朋友聚会"], reason: "Q 弹甜糯" },
    { id: "tiramisu-cup", name: "提拉米苏 杯装", emoji: "🍮", category: "面包糕点", calories: 280, sugar: 22, fat: 16, price: "约 18 元", audiences: ["朋友聚会"], reason: "意式甜点" },
    { id: "egg-roll-wangzai", name: "旺仔 牛奶饼干", emoji: "🍪", category: "饼干曲奇", calories: 200, sugar: 12, fat: 9, price: "约 8 元", audiences: ["儿童"], reason: "童年回忆" },
    { id: "danisa-butter", name: "丹麦蓝罐曲奇", emoji: "🍪", category: "饼干曲奇", calories: 470, sugar: 22, fat: 22, price: "约 28 元", audiences: ["长辈"], reason: "送礼经典" },
    { id: "cracker-soda", name: "嘉顿 苏打饼干", emoji: "🥨", category: "饼干曲奇", calories: 180, sugar: 4, fat: 6, price: "约 10 元", audiences: ["长辈"], reason: "胃不适常备" },
    { id: "cracker-walker", name: "Walkers 黄油饼干", emoji: "🍪", category: "饼干曲奇", calories: 250, sugar: 12, fat: 14, price: "约 22 元", audiences: ["朋友聚会"], reason: "苏格兰黄油饼干" },
    { id: "dried-pineapple", name: "百草味 菠萝干", emoji: "🍍", category: "果干蜜饯", calories: 320, sugar: 70, price: "约 15 元", audiences: ["儿童"], reason: "酸甜果干", caution: "糖密度高" },
    { id: "dried-banana", name: "果园 香蕉片", emoji: "🍌", category: "果干蜜饯", calories: 480, fat: 28, sugar: 35, price: "约 12 元", audiences: ["儿童"], reason: "脆香蕉片" },
    { id: "dried-strawberry", name: "冻干草莓", emoji: "🍓", category: "果干蜜饯", calories: 380, sugar: 75, price: "约 28 元", audiences: ["儿童"], reason: "冻干水果" },
    { id: "dried-blueberry", name: "美国蓝莓干 50g", emoji: "🫐", category: "果干蜜饯", calories: 160, sugar: 33, price: "约 12 元", audiences: ["长辈"], reason: "蓝莓干果" },
    { id: "dried-cranberry", name: "蔓越莓干 50g", emoji: "🔴", category: "果干蜜饯", calories: 165, sugar: 35, price: "约 9 元", audiences: ["儿童", "长辈"], reason: "蔓越莓花青素" },
    { id: "preserved-plum", name: "九制话梅", emoji: "🟤", category: "果干蜜饯", calories: 220, sugar: 54, price: "约 5 元", audiences: ["通勤"], reason: "止吐止馋" },
    { id: "preserved-apricot", name: "杏脯 100g", emoji: "🟧", category: "果干蜜饯", calories: 240, sugar: 50, price: "约 8 元", audiences: ["儿童"], reason: "酸甜杏脯" },
    { id: "raisin-green", name: "新疆青提葡萄干", emoji: "🍇", category: "果干蜜饯", calories: 280, sugar: 60, price: "约 15 元", audiences: ["长辈"], reason: "无核青提" },
    { id: "ribbon-pork", name: "靖江 猪肉脯 100g", emoji: "🥩", category: "肉脯肉干", calories: 380, sugar: 22, fat: 12, protein: 35, price: "约 22 元", audiences: ["增肌"], reason: "蜜汁肉脯" },
    { id: "beef-jerky-classic", name: "美国牛肉干 50g", emoji: "🥩", category: "肉脯肉干", calories: 180, fat: 4, protein: 32, price: "约 18 元", audiences: ["增肌"], reason: "高蛋白原味" },
    { id: "spicy-beef-jerky", name: "麻辣牛肉干 50g", emoji: "🌶️", category: "肉脯肉干", calories: 200, fat: 6, protein: 28, price: "约 18 元", audiences: ["增肌", "解压"], reason: "川式麻辣牛肉" },
    { id: "squid-jerky", name: "鱿鱼丝 50g", emoji: "🦑", category: "肉脯肉干", calories: 180, fat: 2, protein: 35, price: "约 12 元", audiences: ["朋友聚会"], reason: "啃啃磨时间" },
    { id: "magnum", name: "梦龙 雪糕", emoji: "🍦", category: "冰品冰淇淋", calories: 270, sugar: 22, fat: 18, price: "约 12 元", audiences: ["朋友聚会"], reason: "比利时巧克力外壳" },
    { id: "haagen-dazs", name: "哈根达斯 杯装", emoji: "🍨", category: "冰品冰淇淋", calories: 280, sugar: 22, fat: 18, price: "约 38 元", audiences: ["朋友聚会"], reason: "美式高端冰淇淋" },
    { id: "wall-cone", name: "和路雪 可爱多", emoji: "🍦", category: "冰品冰淇淋", calories: 220, sugar: 18, fat: 12, price: "约 6 元", audiences: ["儿童"], reason: "童年甜筒" },
    { id: "yili-classic-ice", name: "伊利 巧乐兹", emoji: "🍦", category: "冰品冰淇淋", calories: 150, sugar: 14, fat: 9, price: "约 4 元", audiences: ["儿童"], reason: "经典巧克力雪糕" },
    { id: "luxue", name: "光明 大白兔雪糕", emoji: "🐇", category: "冰品冰淇淋", calories: 130, sugar: 11, fat: 7, price: "约 6 元", audiences: ["儿童"], reason: "联名雪糕" },
    { id: "popsicle", name: "老冰棍", emoji: "🧊", category: "冰品冰淇淋", calories: 80, sugar: 18, fat: 0, price: "约 1 元", audiences: ["学生党"], reason: "童年冰棍" },
    { id: "mochi-icecream", name: "麻薯雪糕", emoji: "🍡", category: "冰品冰淇淋", calories: 180, sugar: 16, fat: 8, price: "约 8 元", audiences: ["儿童"], reason: "Q 弹麻薯包冰激凌" },
    { id: "ice-bingji", name: "巴比特 冰激凌", emoji: "🍨", category: "冰品冰淇淋", calories: 200, sugar: 18, fat: 11, price: "约 7 元", audiences: ["儿童"], reason: "国产网红" },
    { id: "ice-yili-orchard", name: "伊利 巧蕉力", emoji: "🍫", category: "冰品冰淇淋", calories: 160, sugar: 12, fat: 9, price: "约 5 元", audiences: ["儿童"], reason: "巧克力香蕉味" },
    { id: "noodle-instant-laoba", name: "白象 老坛酸菜面", emoji: "🍜", category: "速食冲泡", calories: 480, fat: 18, protein: 11, price: "约 5 元", audiences: ["学生党"], reason: "酸菜国民泡面", caution: "钠 / 油" },
    { id: "noodle-tang-da-ren", name: "汤达人 韩式辣牛肉面", emoji: "🍜", category: "速食冲泡", calories: 510, fat: 19, protein: 11, price: "约 6 元", audiences: ["学生党", "深夜"], reason: "汤好喝" },
    { id: "noodle-rolling-rich", name: "回家吃饭 番茄牛尾面", emoji: "🍜", category: "速食冲泡", calories: 460, fat: 16, protein: 12, price: "约 8 元", audiences: ["通勤"], reason: "网红泡面" },
    { id: "noodle-li-ziqi", name: "李子柒 螺蛳粉", emoji: "🐌", category: "速食冲泡", calories: 540, fat: 16, protein: 12, price: "约 12 元", audiences: ["学生党"], reason: "广西螺蛳粉" },
    { id: "noodle-haoxiangshi", name: "拉面说 虾蟹云吞面", emoji: "🍜", category: "速食冲泡", calories: 480, fat: 14, protein: 14, price: "约 15 元", audiences: ["通勤"], reason: "高端泡面" },
    { id: "rice-bowl-zhf", name: "自嗨锅 牛肉饭", emoji: "🍱", category: "速食冲泡", calories: 580, fat: 16, protein: 14, price: "约 22 元", audiences: ["通勤", "深夜"], reason: "自嗨自热饭" },
    { id: "self-heat-mixiang", name: "自嗨锅 麻辣米线", emoji: "🥘", category: "速食冲泡", calories: 520, fat: 14, protein: 12, price: "约 18 元", audiences: ["学生党"], reason: "自热米线" },
    { id: "instant-mala-tang", name: "海底捞 自热麻辣烫", emoji: "🥘", category: "速食冲泡", calories: 580, fat: 18, protein: 14, price: "约 22 元", audiences: ["朋友聚会", "深夜"], reason: "自热麻辣烫" },
    { id: "luosi-fen-ll", name: "螺霸王 螺蛳粉", emoji: "🐌", category: "速食冲泡", calories: 510, fat: 14, protein: 12, price: "约 10 元", audiences: ["学生党"], reason: "正宗柳州螺蛳粉" },
    { id: "saiba-coffee", name: "三顿半 即溶咖啡 X3", emoji: "☕", category: "速食冲泡", calories: 5, sugar: 0, price: "约 9 元/颗", audiences: ["通勤"], reason: "精品咖啡丸" },
    { id: "yongpu-coffee", name: "永璞 咖啡液", emoji: "☕", category: "速食冲泡", calories: 5, sugar: 0, price: "约 7 元", audiences: ["通勤"], reason: "鲜萃咖啡液" },
    { id: "ovaltine-pack", name: "阿华田 冲剂", emoji: "🥤", category: "速食冲泡", calories: 200, sugar: 28, price: "约 4 元", audiences: ["儿童"], reason: "童年麦芽" },
    { id: "horlicks", name: "好立克 麦乳精", emoji: "🥤", category: "速食冲泡", calories: 200, sugar: 30, price: "约 5 元", audiences: ["儿童", "长辈"], reason: "童年补品" },
    { id: "yogurt-flavored", name: "蒙牛冠益乳风味", emoji: "🥣", category: "酸奶乳品", calories: 175, sugar: 22, fat: 6, protein: 6, price: "约 5 元", audiences: ["儿童"], reason: "童年酸奶" },
    { id: "ice-tea-canned", name: "康师傅冰红茶", emoji: "🧊", category: "饮料", calories: 120, sugar: 28, price: "约 4 元", audiences: ["学生党"], reason: "国民冰红茶" },
    { id: "iced-green", name: "康师傅冰绿茶", emoji: "🍵", category: "饮料", calories: 120, sugar: 28, price: "约 4 元", audiences: ["学生党"], reason: "经典冰绿茶" },
    { id: "uni-junle", name: "统一 阿萨姆奶茶", emoji: "🥤", category: "饮料", calories: 220, sugar: 30, fat: 6, price: "约 5 元", audiences: ["学生党"], reason: "瓶装奶茶" },
    { id: "wahaha-ad", name: "娃哈哈 AD 钙奶", emoji: "🥛", category: "酸奶乳品", calories: 80, sugar: 12, price: "约 1.5 元", audiences: ["儿童"], reason: "童年补钙水" },
    { id: "wahaha-coc", name: "娃哈哈 营养快线", emoji: "🥤", category: "饮料", calories: 200, sugar: 30, fat: 4, price: "约 4 元", audiences: ["学生党"], reason: "全国饮料经典" },
    { id: "weiwei-jujube", name: "维维豆奶 冲剂", emoji: "🥛", category: "速食冲泡", calories: 200, sugar: 25, fat: 5, protein: 6, price: "约 3 元", audiences: ["学生党"], reason: "童年豆奶粉" },
    { id: "fruity-soft-drink", name: "AD 钙乳酸菌", emoji: "🥛", category: "饮料", calories: 100, sugar: 18, price: "约 3 元", audiences: ["儿童"], reason: "乳酸菌饮料" },
    { id: "snack-spicy-noodle", name: "辣条 卫龙", emoji: "🌶️", category: "速食冲泡", calories: 380, fat: 22, sugar: 6, protein: 10, price: "约 5 元", audiences: ["学生党", "解压"], reason: "国民辣条", caution: "钠 / 油" },
    { id: "snack-konjac", name: "卫龙 魔芋爽", emoji: "🥒", category: "速食冲泡", calories: 80, fat: 1, protein: 1, price: "约 4 元", audiences: ["减脂"], reason: "魔芋低卡" },
    { id: "snack-bone", name: "辣骨头 卫龙", emoji: "🌶️", category: "速食冲泡", calories: 220, fat: 16, sugar: 4, price: "约 6 元", audiences: ["学生党"], reason: "辣骨头嚼劲" },
    { id: "konjac-jelly", name: "魔芋果冻", emoji: "🍮", category: "果干蜜饯", calories: 50, sugar: 8, price: "约 3 元", audiences: ["减脂"], reason: "0 脂肪果冻" },
    { id: "qq-jelly", name: "喜之郎 果冻", emoji: "🍮", category: "果干蜜饯", calories: 90, sugar: 18, price: "约 1 元", audiences: ["儿童"], reason: "童年果冻" },
    { id: "rice-cake-bag", name: "营多印尼炒面", emoji: "🍝", category: "速食冲泡", calories: 480, fat: 18, sugar: 4, protein: 9, price: "约 6 元", audiences: ["学生党"], reason: "印尼方便面" },
    { id: "salt-bagel", name: "全麦贝果", emoji: "🥯", category: "面包糕点", calories: 280, fat: 3, sugar: 4, protein: 10, price: "约 8 元", audiences: ["减脂", "增肌"], reason: "高蛋白主食" },
    { id: "rice-cake-bro", name: "全麦面包 1 片", emoji: "🍞", category: "面包糕点", calories: 80, sugar: 2, fat: 1, protein: 4, price: "约 1 元", audiences: ["减脂"], reason: "低 GI" },
    { id: "muesli-cup", name: "燕麦杯（麦片+奶+水果）", emoji: "🥣", category: "速食冲泡", calories: 220, sugar: 12, fat: 3, protein: 8, price: "约 12 元", audiences: ["减脂"], reason: "5 分钟早餐" },
    { id: "oat-bar", name: "好麦多 燕麦巧克力 80g", emoji: "🥣", category: "速食冲泡", calories: 320, sugar: 14, fat: 12, protein: 6, price: "约 12 元", audiences: ["减脂"], reason: "燕麦零食" },
    { id: "wonderlab", name: "WonderLab 代餐奶昔", emoji: "🥤", category: "蛋白零食", calories: 200, sugar: 6, fat: 8, protein: 18, price: "约 28 元", audiences: ["减脂"], reason: "代餐奶昔" },
    { id: "wahaha-tea", name: "娃哈哈 龙井茶", emoji: "🍵", category: "无糖饮料", calories: 0, sugar: 0, price: "约 4 元", audiences: ["减脂"], reason: "国民无糖" },
    { id: "tea-genki-grape", name: "燃茶 葡萄味", emoji: "🍇", category: "无糖饮料", calories: 0, sugar: 0, price: "约 5 元", audiences: ["减脂"], reason: "燃茶葡萄" },
    { id: "tea-iced-jasmine", name: "茉莉清茶 香飘飘", emoji: "🍵", category: "无糖饮料", calories: 0, sugar: 0, price: "约 5 元", audiences: ["减脂"], reason: "无糖茉莉" },
    { id: "feijia-rice-cake", name: "辣条好哥哥", emoji: "🌶️", category: "速食冲泡", calories: 280, fat: 16, sugar: 4, price: "约 5 元", audiences: ["学生党"], reason: "辣条系列扩展" },
    { id: "spicy-strip-mahuanao", name: "麻辣花菜 卫龙", emoji: "🥬", category: "速食冲泡", calories: 100, fat: 4, price: "约 5 元", audiences: ["减脂"], reason: "魔芋系" },
    { id: "spicy-strip-dofu", name: "豆腐干辣条", emoji: "🟫", category: "速食冲泡", calories: 220, fat: 12, protein: 12, price: "约 4 元", audiences: ["增肌"], reason: "豆制辣条蛋白多" },
    { id: "fruit-cup-canned", name: "水果罐头", emoji: "🍑", category: "果干蜜饯", calories: 120, sugar: 25, price: "约 8 元", audiences: ["儿童", "长辈"], reason: "黄桃罐头国民" },
    { id: "fruit-platter", name: "切好的水果拼盘", emoji: "🍓", category: "果干蜜饯", calories: 80, sugar: 16, price: "约 18 元", audiences: ["减脂"], reason: "便利店现切水果" },
    { id: "import-pretzel", name: "Bahlsen 椒盐脆饼", emoji: "🥨", category: "饼干曲奇", calories: 380, fat: 16, sugar: 4, price: "约 15 元", audiences: ["朋友聚会"], reason: "德国椒盐饼" },
    { id: "import-nuts", name: "Tong Garden 混合坚果", emoji: "🥜", category: "坚果", calories: 600, fat: 50, protein: 18, price: "约 28 元", audiences: ["朋友聚会"], reason: "进口大袋混合坚果" },
    { id: "soy-bean-snack", name: "韩国 BinggraE 香蕉牛奶", emoji: "🍌", category: "酸奶乳品", calories: 180, sugar: 25, fat: 4, protein: 6, price: "约 12 元", audiences: ["儿童"], reason: "韩国国民牛奶" },
    { id: "morinaga-pudding", name: "森永 牛奶布丁", emoji: "🍮", category: "酸奶乳品", calories: 130, sugar: 16, fat: 5, price: "约 8 元", audiences: ["儿童"], reason: "日式布丁" },
    { id: "popcorn-act2", name: "act II 微波爆米花", emoji: "🍿", category: "薯片膨化", calories: 280, fat: 12, sugar: 6, price: "约 10 元", audiences: ["朋友聚会"], reason: "看电影爆米花" },
    { id: "popcorn-tacky", name: "好丽友 焦糖爆米花", emoji: "🍿", category: "薯片膨化", calories: 320, fat: 14, sugar: 18, price: "约 8 元", audiences: ["朋友聚会"], reason: "焦糖爆米花" },
    { id: "yili-mooncake", name: "伊利月饼 1 个", emoji: "🥮", category: "面包糕点", calories: 320, sugar: 28, fat: 14, price: "约 8 元", audiences: ["长辈"], reason: "中秋限定" },
    { id: "swallow-bird-bottle", name: "燕窝即饮 60ml", emoji: "🥃", category: "饮料", calories: 30, sugar: 4, price: "约 65 元", audiences: ["长辈"], reason: "送礼", caution: "智商税要小心" },
    { id: "tonics-pearl", name: "雪花膏 银耳", emoji: "🥣", category: "速食冲泡", calories: 130, sugar: 14, price: "约 18 元", audiences: ["长辈"], reason: "银耳羹" },
  ];
  // 用模板继续凑 — 同一品牌不同口味不同规格
  type FillTpl = { idBase: string; name: string; emoji: string; category: SnackCategory; calBase: number; sugar?: number; fat?: number; protein?: number; price: string; audiences: SnackAudience[]; reason: string; flavors: string[]; caution?: string };
  const fills: FillTpl[] = [
    { idBase: "yogurt-fl", name: "酸奶杯", emoji: "🥄", category: "酸奶乳品", calBase: 110, sugar: 12, fat: 3, protein: 4, price: "约 6 元", audiences: ["儿童", "长辈"], reason: "便利店常备酸奶杯", flavors: ["原味", "草莓", "蓝莓", "芒果", "桃子", "香蕉", "椰果", "燕麦", "百香果", "葡萄"] },
    { idBase: "milk-tea-pack", name: "速溶奶茶", emoji: "🧋", category: "速食冲泡", calBase: 150, sugar: 22, fat: 5, price: "约 4 元", audiences: ["学生党"], reason: "宿舍冲泡奶茶", flavors: ["原味", "巧克力", "焦糖", "香芋", "抹茶", "草莓", "玫瑰", "椰香"], caution: "糖偏高" },
    { idBase: "biscuit-cookie", name: "曲奇饼干", emoji: "🍪", category: "饼干曲奇", calBase: 200, sugar: 14, fat: 10, price: "约 6 元", audiences: ["儿童", "学生党"], reason: "下午茶曲奇", flavors: ["黄油", "巧克力", "椰香", "蔓越莓", "抹茶", "咖啡"] },
    { idBase: "ice-cream-flavor", name: "雪糕", emoji: "🍦", category: "冰品冰淇淋", calBase: 170, sugar: 16, fat: 9, price: "约 5 元", audiences: ["学生党"], reason: "夏日雪糕", flavors: ["香草", "巧克力", "草莓", "抹茶", "椰子", "芒果", "牛奶"] },
    { idBase: "candy-fruit", name: "果味软糖", emoji: "🍬", category: "巧克力糖果", calBase: 90, sugar: 22, price: "约 5 元", audiences: ["儿童"], reason: "果味软糖", flavors: ["草莓", "葡萄", "橙子", "桃子", "西瓜", "苹果"] },
    { idBase: "instant-coffee-fl", name: "速溶咖啡", emoji: "☕", category: "速食冲泡", calBase: 70, sugar: 11, fat: 3, price: "约 3 元", audiences: ["通勤", "学生党"], reason: "雀巢咖啡国民", flavors: ["拿铁", "卡布奇诺", "焦糖玛奇朵", "摩卡", "美式"] },
    { idBase: "yam-ks", name: "魔芋丝", emoji: "🥒", category: "速食冲泡", calBase: 60, fat: 1, price: "约 4 元", audiences: ["减脂"], reason: "魔芋低卡", flavors: ["原味", "麻辣", "酸辣", "香辣", "葱香"] },
    { idBase: "cake-suzhou", name: "苏式糕点", emoji: "🥮", category: "面包糕点", calBase: 200, sugar: 14, fat: 8, price: "约 6 元", audiences: ["长辈"], reason: "苏式糕点", flavors: ["豆沙", "百果", "椰蓉", "黑芝麻", "芋泥"] },
    { idBase: "candy-hard", name: "硬糖", emoji: "🍬", category: "巧克力糖果", calBase: 50, sugar: 12, price: "约 5 元", audiences: ["长辈"], reason: "经典硬糖", flavors: ["薄荷", "柠檬", "可乐", "蜂蜜", "牛奶"] },
    { idBase: "salt-pretzel", name: "椒盐脆饼", emoji: "🥨", category: "饼干曲奇", calBase: 380, fat: 16, sugar: 4, price: "约 12 元", audiences: ["朋友聚会"], reason: "啤酒搭子", flavors: ["原味", "海盐", "蒜香", "黑椒"] },
    { idBase: "milkshake", name: "代餐奶昔", emoji: "🥤", category: "蛋白零食", calBase: 200, sugar: 6, fat: 7, protein: 18, price: "约 25 元", audiences: ["减脂", "增肌"], reason: "代餐奶昔", flavors: ["巧克力", "草莓", "抹茶", "香草", "焦糖"] },
    { idBase: "fruit-juice-bag", name: "饮品袋", emoji: "🧃", category: "饮料", calBase: 110, sugar: 22, price: "约 4 元", audiences: ["儿童"], reason: "果汁饮品", flavors: ["苹果", "橙子", "葡萄", "西瓜", "桃子"] },
    { idBase: "instant-soup", name: "速冲汤", emoji: "🍲", category: "速食冲泡", calBase: 90, fat: 2, sugar: 4, price: "约 3 元", audiences: ["长辈", "通勤"], reason: "速冲老火汤", flavors: ["紫菜蛋花", "番茄蛋花", "玉米排骨", "香菇鸡汤", "罗宋", "酸辣"] },
    { idBase: "yogurt-stick", name: "酸奶冰棒", emoji: "🍦", category: "冰品冰淇淋", calBase: 80, sugar: 10, fat: 2, protein: 3, price: "约 4 元", audiences: ["儿童"], reason: "酸奶冰棒", flavors: ["原味", "草莓", "蓝莓", "黄桃", "百香果"] },
  ];
  const out: Snack[] = [...tpls];
  for (const f of fills) {
    for (let i = 0; i < f.flavors.length; i++) {
      const flv = f.flavors[i];
      out.push({
        id: `${f.idBase}-${i}`,
        name: `${f.name}（${flv}味）`,
        emoji: f.emoji,
        category: f.category,
        calories: f.calBase + Math.round((i % 4) * 5),
        sugar: f.sugar,
        fat: f.fat,
        protein: f.protein,
        price: f.price,
        audiences: f.audiences,
        reason: f.reason,
        caution: f.caution,
      });
    }
  }
  return out;
}

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

/** 美团闪购 / 百度兜底搜索入口
 *  v2: 美团闪购的 H5 搜索 URL 多次改版，不同地域返回 error_page，故主入口改走
 *  「百度站内搜索 site:meituan.com」走稳；点评直达放为副入口并标注「可能不可用」。
 */
export function snackSearchLinks(name: string): { label: string; href: string; note?: string }[] {
  const q = encodeURIComponent(name);
  return [
    { label: "美团闪购（稳定搜索入口）", href: `https://www.baidu.com/s?wd=${encodeURIComponent("美团闪购 " + name)}` },
    { label: "京东到家搜", href: `https://search.jd.com/Search?keyword=${q}` },
    { label: "淘宝搜", href: `https://s.taobao.com/search?q=${q}` },
    { label: "百度搜", href: `https://www.baidu.com/s?wd=${q}` },
    { label: "美团闪购 直达（可能不可用）", href: `https://i.meituan.com/awp/h5/search/result.html?q=${q}`, note: "美团 H5 入口多次改版，可能 error_page" },
  ];
}

