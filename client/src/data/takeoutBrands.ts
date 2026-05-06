// 外卖品牌库：常见全国连锁品牌 + 推荐菜单 + 适合预算 / 人数 / 口味 / 热量。
// 静态数据，不抓取任何商户 / 平台 API。图片用品牌首字 + emoji + 渐变 fallback，
// 避免商标硬链可能引发的版权 / 加载问题。

export type TakeoutTaste =
  | "辣"
  | "清淡"
  | "甜"
  | "咸鲜"
  | "酸辣"
  | "油腻"
  | "热量低";

export type TakeoutCategory =
  | "汉堡炸鸡"
  | "中式快餐"
  | "披萨意面"
  | "粉面"
  | "饭团便当"
  | "烤肉烧烤"
  | "饺子小笼"
  | "茶饮咖啡"
  | "奶茶饮品"
  | "小吃零嘴"
  | "火锅麻辣烫"
  | "粥早餐"
  | "甜品下午茶"
  | "海鲜日料"
  | "健康轻食"
  | "面包烘焙";

export interface TakeoutBrand {
  id: string;
  name: string;
  emoji: string;
  /** 渐变 fallback */
  gradient: [string, string];
  category: TakeoutCategory;
  /** 适合预算（人均，元） */
  budgetMin: number;
  budgetMax: number;
  /** 适合人数 */
  peopleMin: number;
  peopleMax: number;
  tastes: TakeoutTaste[];
  /** 一句话简介 */
  intro: string;
  /** 推荐菜单（最具代表性） */
  picks: { name: string; price?: string; cal?: string; note?: string }[];
  /** 凑券 / 优惠提示 */
  couponHint: string;
  /** 热量大致范围 */
  calorieHint: string;
  /** 是否覆盖小城市（默认 true，少数高线城市才有的标 false） */
  citySpread: "全国" | "一二线" | "高线";
  /** 适合的就餐场景 */
  scenes: ("一人食" | "工作餐" | "家庭聚餐" | "朋友聚会" | "下午茶" | "深夜")[];
}

// 12+ 全国连锁 + 几个全国高频品类
export const TAKEOUT_BRANDS: TakeoutBrand[] = [
  // ===== 汉堡炸鸡 =====
  {
    id: "kfc", name: "肯德基", emoji: "🍔",
    gradient: ["#e4001b", "#a30013"],
    category: "汉堡炸鸡",
    budgetMin: 18, budgetMax: 60, peopleMin: 1, peopleMax: 4,
    tastes: ["咸鲜", "油腻"],
    intro: "全国 KFC 9000+ 门店，疯狂星期四 9.9 神券常驻。",
    picks: [
      { name: "原味鸡 + 香辣鸡腿堡套餐", price: "约 38 元", cal: "≈900 kcal", note: "饱腹首选" },
      { name: "疯四 V 我 50 全家桶", price: "≈99 元", cal: "≈1800 kcal", note: "3-4 人分着吃" },
      { name: "嫩牛五方 + 老北京鸡肉卷", price: "约 22-26 元", cal: "≈600 kcal", note: "经典回归" },
      { name: "K Coffee 拿铁", price: "≈12 元", cal: "≈90 kcal", note: "性价比咖啡" },
    ],
    couponHint: "周四锁神券；KFC 会员 99 元月卡叠加 0 元配送",
    calorieHint: "单人套餐 600-1100 kcal，全家桶按人头算约 500 kcal/人",
    citySpread: "全国",
    scenes: ["一人食", "工作餐", "家庭聚餐", "深夜"],
  },
  {
    id: "mcd", name: "麦当劳", emoji: "🍟",
    gradient: ["#ffcc00", "#e01a1a"],
    category: "汉堡炸鸡",
    budgetMin: 13, budgetMax: 55, peopleMin: 1, peopleMax: 4,
    tastes: ["咸鲜", "油腻"],
    intro: "麦当劳穷鬼套餐 13.9 起，1 + 1 随心配出名。",
    picks: [
      { name: "1+1 随心配套餐", price: "13.9 元", cal: "≈600 kcal", note: "汉堡薯条灵活搭" },
      { name: "巨无霸套餐", price: "约 35 元", cal: "≈1100 kcal" },
      { name: "板烧鸡腿堡套餐", price: "约 32 元", cal: "≈900 kcal", note: "口味相对清淡" },
      { name: "麦麦脆汁鸡 + 鸡块", price: "约 28-35 元", cal: "≈800 kcal" },
    ],
    couponHint: "麦麦周五；月卡 9.9 早餐；满 30-10 神券",
    calorieHint: "穷鬼套餐 ≈600 kcal，巨无霸套餐 1000+ kcal",
    citySpread: "全国",
    scenes: ["一人食", "工作餐", "深夜"],
  },
  {
    id: "dicos", name: "德克士", emoji: "🍗",
    gradient: ["#e2231a", "#7a1010"],
    category: "汉堡炸鸡",
    budgetMin: 15, budgetMax: 45, peopleMin: 1, peopleMax: 3,
    tastes: ["咸鲜", "油腻"],
    intro: "三四线城市覆盖更广，脆皮炸鸡是招牌。",
    picks: [
      { name: "脆皮炸鸡 + 鸡腿堡套餐", price: "约 26 元", cal: "≈800 kcal" },
      { name: "脆皮鸡 5 块装", price: "约 36 元", cal: "≈1100 kcal", note: "2 人分" },
      { name: "黄金薯条 + 蛋挞", price: "约 18 元" },
    ],
    couponHint: "App 会员 9.9 早餐券；30-8 平台券常见",
    calorieHint: "套餐 700-1100 kcal",
    citySpread: "全国",
    scenes: ["一人食", "工作餐"],
  },
  {
    id: "wallace", name: "华莱士", emoji: "🐔",
    gradient: ["#f4a800", "#a86a00"],
    category: "汉堡炸鸡",
    budgetMin: 10, budgetMax: 35, peopleMin: 1, peopleMax: 3,
    tastes: ["咸鲜", "油腻"],
    intro: "号称「中式肯德基」，最适合学生 / 一人食低预算。",
    picks: [
      { name: "全鸡桶 ≈19.9", price: "19.9 元", cal: "≈1300 kcal", note: "一只全鸡 1-2 人分" },
      { name: "汉堡薯条可乐套餐", price: "约 15 元", cal: "≈700 kcal" },
      { name: "鸡腿堡 + 鸡米花", price: "约 18 元" },
    ],
    couponHint: "美团团购 9.9 神套常驻；新人首单立减 5",
    calorieHint: "全鸡桶 ≈1300 kcal，单人套餐 ≈700 kcal",
    citySpread: "全国",
    scenes: ["一人食", "工作餐"],
  },
  {
    id: "tastien", name: "塔斯汀", emoji: "🍔",
    gradient: ["#dd1f26", "#7e0d10"],
    category: "汉堡炸鸡",
    budgetMin: 15, budgetMax: 40, peopleMin: 1, peopleMax: 3,
    tastes: ["咸鲜"],
    intro: "中国汉堡黑马，手擀堡胚 + 北京烤鸭/孜然羊肉等中式馅。",
    picks: [
      { name: "北京烤鸭堡 + 鸡米花", price: "约 25 元", cal: "≈700 kcal", note: "中式特色" },
      { name: "麻辣牛肉堡套餐", price: "约 28 元", cal: "≈800 kcal" },
      { name: "鸡腿堡双堡套餐", price: "约 35 元" },
    ],
    couponHint: "新人 9.9 单人餐；30-12 满减常驻",
    calorieHint: "套餐 ≈700-900 kcal",
    citySpread: "全国",
    scenes: ["一人食", "工作餐"],
  },

  // ===== 中式快餐 =====
  {
    id: "xiangcunji", name: "乡村基", emoji: "🍱",
    gradient: ["#e3431b", "#7a2010"],
    category: "中式快餐",
    budgetMin: 18, budgetMax: 45, peopleMin: 1, peopleMax: 4,
    tastes: ["咸鲜", "辣"],
    intro: "西南地区领先的中式快餐，川味盖饭好评。",
    picks: [
      { name: "椒麻鸡腿饭", price: "约 25 元", cal: "≈700 kcal", note: "现炒小份" },
      { name: "番茄牛腩饭", price: "约 28 元", cal: "≈650 kcal" },
      { name: "酸辣土豆丝盖饭", price: "约 18 元", cal: "≈550 kcal", note: "素食可考虑" },
    ],
    couponHint: "美团 / 抖音 25-8 神券，会员日 8 折",
    calorieHint: "盖饭 550-800 kcal",
    citySpread: "全国",
    scenes: ["一人食", "工作餐"],
  },
  {
    id: "laoxiangji", name: "老乡鸡", emoji: "🍲",
    gradient: ["#f7a900", "#a16700"],
    category: "中式快餐",
    budgetMin: 20, budgetMax: 50, peopleMin: 1, peopleMax: 4,
    tastes: ["清淡", "咸鲜"],
    intro: "鸡汤中式快餐头牌，安徽 / 华东覆盖广。",
    picks: [
      { name: "招牌鸡汤 + 米饭", price: "约 28 元", cal: "≈480 kcal", note: "清淡养胃" },
      { name: "肥西老母鸡套餐", price: "约 35 元", cal: "≈600 kcal" },
      { name: "番茄炒蛋 + 米饭", price: "约 18 元", cal: "≈500 kcal" },
      { name: "梅干菜扣肉饭", price: "约 32 元", cal: "≈800 kcal" },
    ],
    couponHint: "App 会员日 8 折；满 30-8 美团神券常驻",
    calorieHint: "汤饭组合 ≈500 kcal",
    citySpread: "全国",
    scenes: ["一人食", "工作餐", "家庭聚餐"],
  },
  {
    id: "damixiansheng", name: "大米先生", emoji: "🍚",
    gradient: ["#f4a045", "#8b3a18"],
    category: "中式快餐",
    budgetMin: 15, budgetMax: 40, peopleMin: 1, peopleMax: 4,
    tastes: ["咸鲜", "辣"],
    intro: "重庆 / 华西流行的「2 荤 1 素 + 例汤」称重模式。",
    picks: [
      { name: "2 荤 1 素 + 例汤", price: "约 22-30 元", cal: "≈650 kcal", note: "蛋白质均衡" },
      { name: "麻辣土豆丝 + 回锅肉饭", price: "约 28 元", cal: "≈800 kcal" },
      { name: "番茄鸡蛋 + 红烧肉饭", price: "约 30 元" },
    ],
    couponHint: "美团满 25-7 / 抖音次卡 19.9",
    calorieHint: "称重套餐 600-800 kcal",
    citySpread: "全国",
    scenes: ["一人食", "工作餐"],
  },
  {
    id: "yonghedawang", name: "永和大王", emoji: "🥟",
    gradient: ["#3aae66", "#1d6e3e"],
    category: "中式快餐",
    budgetMin: 15, budgetMax: 40, peopleMin: 1, peopleMax: 3,
    tastes: ["清淡", "咸鲜"],
    intro: "豆浆油条 + 卤肉饭，全天候经营。",
    picks: [
      { name: "豆浆油条 + 茶叶蛋", price: "约 12 元", cal: "≈400 kcal", note: "早餐首选" },
      { name: "卤肉饭套餐", price: "约 25 元", cal: "≈700 kcal" },
      { name: "招牌饭 + 玉米浓汤", price: "约 32 元" },
    ],
    couponHint: "9.9 早餐券常驻；满 25-8",
    calorieHint: "早餐 400 kcal / 正餐 700 kcal",
    citySpread: "全国",
    scenes: ["一人食", "工作餐"],
  },

  // ===== 披萨意面 =====
  {
    id: "pizzahut", name: "必胜客", emoji: "🍕",
    gradient: ["#ee4137", "#8d211a"],
    category: "披萨意面",
    budgetMin: 35, budgetMax: 120, peopleMin: 1, peopleMax: 5,
    tastes: ["咸鲜", "油腻"],
    intro: "披萨 + 意面 + 沙拉的西餐主流，家庭分享套餐多。",
    picks: [
      { name: "9 寸披萨 + 鸡翅 + 沙拉", price: "约 88 元", cal: "≈1500 kcal", note: "2 人分享" },
      { name: "意面单人套餐", price: "约 45 元", cal: "≈800 kcal" },
      { name: "学生 9.9 单点", price: "9.9-25 元", note: "凭学生证 / App 限时" },
    ],
    couponHint: "周三披萨 6 折；88-30 / 128-50 大单档",
    calorieHint: "9 寸披萨 ≈1500 kcal（2 人分享），意面 ≈800 kcal",
    citySpread: "全国",
    scenes: ["朋友聚会", "家庭聚餐"],
  },
  {
    id: "domino", name: "达美乐", emoji: "🍕",
    gradient: ["#0078ae", "#003a55"],
    category: "披萨意面",
    budgetMin: 40, budgetMax: 130, peopleMin: 2, peopleMax: 5,
    tastes: ["咸鲜"],
    intro: "30 分钟必达，专注披萨 + 鸡翅。",
    picks: [
      { name: "9 寸经典披萨", price: "约 79 元", cal: "≈1400 kcal", note: "2 人份" },
      { name: "12 寸大披萨 + 鸡翅", price: "约 138 元", cal: "≈2400 kcal", note: "3-4 人份" },
      { name: "肉丸意面", price: "约 39 元", cal: "≈800 kcal" },
    ],
    couponHint: "App 第二份半价；满 99-30",
    calorieHint: "9 寸披萨 1300-1500 kcal",
    citySpread: "一二线",
    scenes: ["家庭聚餐", "朋友聚会"],
  },
  {
    id: "saizeriya", name: "萨莉亚", emoji: "🍝",
    gradient: ["#127a36", "#0a4520"],
    category: "披萨意面",
    budgetMin: 25, budgetMax: 80, peopleMin: 1, peopleMax: 5,
    tastes: ["咸鲜"],
    intro: "便宜大碗的意式简餐，人均 30 元也能吃到正餐。",
    picks: [
      { name: "肉酱意面 + 鸡腿", price: "约 35 元", cal: "≈800 kcal" },
      { name: "焗饭 + 蘑菇汤", price: "约 30 元", cal: "≈700 kcal" },
      { name: "披萨 + 沙拉单人套餐", price: "约 45 元", cal: "≈900 kcal" },
    ],
    couponHint: "本身价格已低，平台券较少；首单立减常见",
    calorieHint: "套餐 700-1000 kcal",
    citySpread: "一二线",
    scenes: ["一人食", "朋友聚会"],
  },

  // ===== 粉面 =====
  {
    id: "lzlamian", name: "兰州拉面", emoji: "🍜",
    gradient: ["#bcc16e", "#5a5e26"],
    category: "粉面",
    budgetMin: 12, budgetMax: 30, peopleMin: 1, peopleMax: 3,
    tastes: ["咸鲜", "清淡"],
    intro: "全国 mom-and-pop 拉面店覆盖最广，10 元就能吃饱。",
    picks: [
      { name: "牛肉拉面 + 茶叶蛋", price: "约 14 元", cal: "≈600 kcal" },
      { name: "牛肉炒拉条 + 紫菜蛋汤", price: "约 22 元", cal: "≈800 kcal" },
      { name: "凉皮 + 肉夹馍", price: "约 18 元", cal: "≈700 kcal", note: "陕西风味" },
    ],
    couponHint: "美团 12-3 / 7-2 神券；新店首单立减 5",
    calorieHint: "面 ≈600-800 kcal",
    citySpread: "全国",
    scenes: ["一人食", "工作餐"],
  },
  {
    id: "shaxian", name: "沙县小吃", emoji: "🥟",
    gradient: ["#5e9c45", "#2d4f1e"],
    category: "粉面",
    budgetMin: 10, budgetMax: 30, peopleMin: 1, peopleMax: 4,
    tastes: ["清淡", "咸鲜"],
    intro: "全国小吃集合，蒸饺 + 馄饨 + 拌面性价比高。",
    picks: [
      { name: "蒸饺 + 馄饨 + 拌面套餐", price: "约 18 元", cal: "≈700 kcal" },
      { name: "炖罐汤（花旗参乌鸡）", price: "约 16 元", cal: "≈300 kcal", note: "养生" },
      { name: "卤蛋 + 拌面", price: "约 12 元", cal: "≈500 kcal" },
    ],
    couponHint: "5-3 / 8-3 神券；连锁化品牌另有 30-10",
    calorieHint: "组合 500-700 kcal",
    citySpread: "全国",
    scenes: ["一人食", "工作餐"],
  },
  {
    id: "huangmenji", name: "黄焖鸡米饭", emoji: "🍗",
    gradient: ["#f4a045", "#a85a2c"],
    category: "中式快餐",
    budgetMin: 15, budgetMax: 35, peopleMin: 1, peopleMax: 3,
    tastes: ["咸鲜", "辣"],
    intro: "全国十几万家黄焖鸡，是「不知道吃啥」的兜底。",
    picks: [
      { name: "招牌黄焖鸡 + 米饭", price: "约 22 元", cal: "≈750 kcal" },
      { name: "中辣 + 加鹌鹑蛋", price: "约 27 元" },
      { name: "土豆 + 香菇加料", price: "+5 元", note: "蔬菜更多" },
    ],
    couponHint: "美团满 20-7 / 抖音 15.9 次卡",
    calorieHint: "盖饭 ≈750 kcal",
    citySpread: "全国",
    scenes: ["一人食", "工作餐"],
  },

  // ===== 茶饮 =====
  {
    id: "chabaidao", name: "茶百道", emoji: "🧋",
    gradient: ["#d33b50", "#7d1f2c"],
    category: "茶饮咖啡",
    budgetMin: 12, budgetMax: 25, peopleMin: 1, peopleMax: 3,
    tastes: ["甜"],
    intro: "新中式茶饮主力，水果茶 / 奶茶都强。",
    picks: [
      { name: "杨枝甘露", price: "约 18 元", cal: "≈350 kcal", note: "招牌" },
      { name: "招牌奶茶（无糖）", price: "约 16 元", cal: "≈180 kcal" },
      { name: "鲜果茶（春夏限定）", price: "约 19 元", cal: "≈250 kcal" },
    ],
    couponHint: "第二杯半价；外卖 25-5 神券",
    calorieHint: "无糖奶茶 ≈180 kcal，加料 +100 kcal",
    citySpread: "全国",
    scenes: ["下午茶", "朋友聚会"],
  },
  {
    id: "bawang", name: "霸王茶姬", emoji: "🍵",
    gradient: ["#1f3b2a", "#0a1c12"],
    category: "茶饮咖啡",
    budgetMin: 14, budgetMax: 26, peopleMin: 1, peopleMax: 3,
    tastes: ["甜", "清淡"],
    intro: "原叶鲜奶茶代表，伯牙绝弦广为流传。",
    picks: [
      { name: "伯牙绝弦", price: "约 17 元", cal: "≈250 kcal", note: "经典原叶" },
      { name: "桂馥兰香", price: "约 18 元", cal: "≈300 kcal" },
      { name: "万里木兰（无糖）", price: "约 18 元", cal: "≈180 kcal" },
    ],
    couponHint: "新店开业首杯立减 5；满 30-5",
    calorieHint: "原叶奶茶 200-350 kcal",
    citySpread: "全国",
    scenes: ["下午茶"],
  },
  {
    id: "luckin", name: "瑞幸咖啡", emoji: "☕",
    gradient: ["#0d3a8a", "#06204b"],
    category: "茶饮咖啡",
    budgetMin: 9, budgetMax: 22, peopleMin: 1, peopleMax: 3,
    tastes: ["清淡"],
    intro: "9.9 咖啡常驻，早餐配豆浆三明治也行。",
    picks: [
      { name: "生椰拿铁", price: "9.9-19 元", cal: "≈220 kcal", note: "招牌" },
      { name: "美式咖啡", price: "9.9 元", cal: "≈10 kcal", note: "无糖低卡" },
      { name: "周一新品", price: "约 16 元", note: "尝鲜" },
    ],
    couponHint: "App 周一 9.9 神券；满减 25-8",
    calorieHint: "美式 10 kcal，奶咖 200-350 kcal",
    citySpread: "全国",
    scenes: ["一人食", "下午茶", "工作餐"],
  },

  // ===== 火锅 / 粥早餐 / 健康轻食 =====
  {
    id: "yang5", name: "杨国福麻辣烫", emoji: "🥘",
    gradient: ["#c8000a", "#660005"],
    category: "火锅麻辣烫",
    budgetMin: 18, budgetMax: 50, peopleMin: 1, peopleMax: 3,
    tastes: ["辣", "咸鲜"],
    intro: "全国麻辣烫连锁，自选称重，蔬菜+蛋白可控。",
    picks: [
      { name: "番茄锅 + 自选 8 串菜", price: "约 30 元", cal: "≈500 kcal", note: "番茄锅热量低" },
      { name: "麻辣锅 + 鸡丝凉面", price: "约 35 元", cal: "≈800 kcal" },
      { name: "骨汤锅 + 杂菌豆腐", price: "约 25 元", cal: "≈450 kcal" },
    ],
    couponHint: "30-8 神券；会员卡 8.5 折",
    calorieHint: "番茄锅 400-500 kcal，麻辣锅 700+ kcal",
    citySpread: "全国",
    scenes: ["一人食", "工作餐"],
  },
  {
    id: "haidilao", name: "海底捞外送", emoji: "🍲",
    gradient: ["#e3251b", "#7a0f0a"],
    category: "火锅麻辣烫",
    budgetMin: 60, budgetMax: 200, peopleMin: 2, peopleMax: 6,
    tastes: ["辣", "咸鲜"],
    intro: "外卖配送锅具 + 调料，主打 2-4 人聚餐。",
    picks: [
      { name: "鸳鸯锅 + 4-5 菜", price: "约 168 元", cal: "≈2400 kcal", note: "2-3 人份" },
      { name: "番茄牛肉锅家庭套餐", price: "约 198 元", cal: "≈3000 kcal" },
      { name: "海底捞自热小火锅", price: "29-39 元", cal: "≈600 kcal", note: "一人食" },
    ],
    couponHint: "App 满 200-50；99 元会员券包",
    calorieHint: "2 人锅 ≈2400 kcal（按人均 1200 kcal）",
    citySpread: "一二线",
    scenes: ["家庭聚餐", "朋友聚会"],
  },
  {
    id: "manwo", name: "曼玲粥铺", emoji: "🥣",
    gradient: ["#8aa755", "#3f5224"],
    category: "粥早餐",
    budgetMin: 14, budgetMax: 35, peopleMin: 1, peopleMax: 3,
    tastes: ["清淡"],
    intro: "皮蛋瘦肉粥 + 包子 + 油条，早晚通吃。",
    picks: [
      { name: "皮蛋瘦肉粥 + 油条", price: "约 16 元", cal: "≈400 kcal" },
      { name: "海鲜粥 + 蒸饺", price: "约 28 元", cal: "≈550 kcal" },
      { name: "南瓜粥 + 鸡蛋", price: "约 18 元", cal: "≈350 kcal", note: "清淡养胃" },
    ],
    couponHint: "30-8 神券；早餐 9.9 套餐",
    calorieHint: "粥配油条 350-550 kcal",
    citySpread: "全国",
    scenes: ["一人食", "工作餐"],
  },
  {
    id: "shabushabu", name: "呷哺呷哺", emoji: "🍲",
    gradient: ["#dd2034", "#7a0f1a"],
    category: "火锅麻辣烫",
    budgetMin: 35, budgetMax: 80, peopleMin: 1, peopleMax: 3,
    tastes: ["辣", "咸鲜"],
    intro: "一人小火锅起家，外送一人食套餐很全。",
    picks: [
      { name: "番茄牛肉一人锅", price: "约 49 元", cal: "≈900 kcal" },
      { name: "麻辣鸳鸯一人锅", price: "约 55 元", cal: "≈1100 kcal" },
      { name: "酸菜鱼一人份", price: "约 45 元", cal: "≈800 kcal" },
    ],
    couponHint: "App 满 50-15；下午茶时段半价",
    calorieHint: "一人锅 800-1100 kcal",
    citySpread: "一二线",
    scenes: ["一人食"],
  },
  {
    id: "subway", name: "赛百味 Subway", emoji: "🥪",
    gradient: ["#008c44", "#003e1c"],
    category: "健康轻食",
    budgetMin: 25, budgetMax: 50, peopleMin: 1, peopleMax: 2,
    tastes: ["清淡", "咸鲜", "热量低"],
    intro: "可定制三明治，蔬菜量大、热量可控，减脂常选。",
    picks: [
      { name: "鸡胸三明治（不要酱）", price: "约 32 元", cal: "≈350 kcal", note: "减脂友好" },
      { name: "金枪鱼三明治套餐", price: "约 38 元", cal: "≈500 kcal" },
      { name: "烤牛肉三明治", price: "约 36 元", cal: "≈480 kcal" },
    ],
    couponHint: "App 第二份半价；30-10 满减",
    calorieHint: "去酱减酱 350 kcal，加酱 500+ kcal",
    citySpread: "一二线",
    scenes: ["一人食", "工作餐"],
  },
  {
    id: "wallace2", name: "正新鸡排", emoji: "🍗",
    gradient: ["#d6291f", "#73140d"],
    category: "小吃零嘴",
    budgetMin: 10, budgetMax: 30, peopleMin: 1, peopleMax: 2,
    tastes: ["咸鲜", "油腻"],
    intro: "夜宵 / 解馋首选，鸡排 + 鸡翅 + 鸡米花。",
    picks: [
      { name: "脆皮鸡排", price: "约 13 元", cal: "≈500 kcal", note: "经典" },
      { name: "鸡米花 + 薯条", price: "约 16 元", cal: "≈700 kcal" },
      { name: "鸡翅 4 个", price: "约 18 元", cal: "≈450 kcal" },
    ],
    couponHint: "美团 15-5 / 22-8",
    calorieHint: "鸡排单点 500 kcal",
    citySpread: "全国",
    scenes: ["深夜", "朋友聚会"],
  },
];

export const TAKEOUT_CATEGORIES: TakeoutCategory[] = [
  "汉堡炸鸡", "中式快餐", "披萨意面", "粉面", "饭团便当",
  "烤肉烧烤", "饺子小笼", "茶饮咖啡", "奶茶饮品", "小吃零嘴",
  "火锅麻辣烫", "粥早餐", "甜品下午茶", "海鲜日料", "健康轻食", "面包烘焙",
];

export interface TakeoutPickInput {
  /** 城市（仅用作展示） */
  city?: string;
  /** 总预算 */
  budget: number;
  /** 人数 */
  people: number;
  /** 偏好口味 */
  tastes: TakeoutTaste[];
  /** 当前 slot：早 / 午 / 晚 / 夜宵 */
  slot?: "breakfast" | "lunch" | "dinner" | "midnight";
  /** 减脂偏好 */
  lowCalorie?: boolean;
}

export interface TakeoutPickResult {
  special: TakeoutBrand;
  /** 备选 3-5 */
  alternatives: TakeoutBrand[];
  /** 一句友好的「替你决定」文案 */
  decisionLine: string;
  /** 人均预算估算 */
  perPerson: number;
}

const SLOT_BIAS: Record<NonNullable<TakeoutPickInput["slot"]>, TakeoutCategory[]> = {
  breakfast: ["粥早餐", "面包烘焙", "茶饮咖啡"],
  lunch: ["中式快餐", "粉面", "汉堡炸鸡", "饺子小笼", "健康轻食"],
  dinner: ["火锅麻辣烫", "披萨意面", "中式快餐", "烤肉烧烤", "海鲜日料"],
  midnight: ["小吃零嘴", "汉堡炸鸡", "粉面"],
};

export function pickTakeout(input: TakeoutPickInput): TakeoutPickResult {
  const perPerson = Math.max(8, Math.round(input.budget / Math.max(1, input.people)));
  const slotCats = input.slot ? SLOT_BIAS[input.slot] : [];

  const scored = TAKEOUT_BRANDS.map((b) => {
    let score = 0;
    // 预算匹配（核心）
    if (perPerson >= b.budgetMin && perPerson <= b.budgetMax) score += 30;
    else if (perPerson >= b.budgetMin * 0.85 && perPerson <= b.budgetMax * 1.15) score += 18;
    else score += Math.max(0, 10 - Math.abs(perPerson - (b.budgetMin + b.budgetMax) / 2) / 4);
    // 人数匹配
    if (input.people >= b.peopleMin && input.people <= b.peopleMax) score += 18;
    // 口味
    const tasteHits = input.tastes.filter((t) => b.tastes.includes(t)).length;
    score += tasteHits * 8;
    // slot
    if (slotCats.includes(b.category)) score += 12;
    // 低卡偏好：避开油腻类，加成 健康轻食 / 粥
    if (input.lowCalorie) {
      if (b.tastes.includes("油腻")) score -= 10;
      if (b.tastes.includes("热量低") || b.category === "健康轻食" || b.category === "粥早餐") score += 14;
    }
    // 城市覆盖：如未指定一二线，则全国品牌优先
    if (b.citySpread === "全国") score += 4;
    // 加一点随机扰动让结果不会一直相同
    score += Math.random() * 6;
    return { brand: b, score };
  }).sort((a, b) => b.score - a.score);

  const special = scored[0].brand;
  const alternatives = scored.slice(1, 5).map((s) => s.brand);

  const decisionLine = (() => {
    const parts: string[] = [];
    if (input.lowCalorie) parts.push("减脂友好优先");
    if (input.tastes.length > 0) parts.push(`偏好「${input.tastes.join("·")}」`);
    if (input.slot === "breakfast") parts.push("早餐场景");
    if (input.slot === "midnight") parts.push("深夜");
    if (parts.length === 0) parts.push(`人均 ${perPerson} 元 · ${input.people} 人`);
    return `今天替你决定：${special.name} — ${parts.join(" / ")}`;
  })();

  return { special, alternatives, decisionLine, perPerson };
}
