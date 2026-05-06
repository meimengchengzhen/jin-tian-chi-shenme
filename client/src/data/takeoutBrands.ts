// 外卖品牌库：常见全国连锁品牌 + 推荐菜单 + 适合预算 / 人数 / 口味 / 热量。
// 静态数据，不抓取任何商户 / 平台 API。图片用品牌首字 + emoji + 渐变 fallback，
// 避免商标硬链可能引发的版权 / 加载问题。

export type TakeoutTaste =
  | "辣"
  | "麻辣"
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
  ...buildExtraBrands(),
];

// v2: 200+ 品牌库 — 用模板生成补足，覆盖国民常见连锁与品类。
// 仍然是「常见连锁/品类」标签，不虚构具体门店地址；图片用首字 + emoji + 渐变 fallback。
function buildExtraBrands(): TakeoutBrand[] {
  type Tpl = {
    id: string; name: string; emoji: string; gradient: [string, string];
    category: TakeoutCategory; budgetMin: number; budgetMax: number;
    peopleMin: number; peopleMax: number; tastes: TakeoutTaste[];
    intro: string; picks: string[]; couponHint: string; calorieHint: string;
    citySpread: TakeoutBrand["citySpread"]; scenes: TakeoutBrand["scenes"];
  };
  const tpls: Tpl[] = [
    { id: "burgerking", name: "汉堡王", emoji: "🍔", gradient: ["#d62300", "#7a1300"], category: "汉堡炸鸡", budgetMin: 22, budgetMax: 60, peopleMin: 1, peopleMax: 3, tastes: ["咸鲜", "油腻"], intro: "皇堡 / 安格斯牛肉堡更厚实。", picks: ["安格斯厚牛堡 32", "皇堡套餐 36", "纸包鸡 22"], couponHint: "周三皇堡日；30-10 神券", calorieHint: "套餐 800-1100 kcal", citySpread: "一二线", scenes: ["一人食", "工作餐"] },
    { id: "popeyes", name: "Popeyes", emoji: "🍗", gradient: ["#ff6a00", "#a83400"], category: "汉堡炸鸡", budgetMin: 35, budgetMax: 90, peopleMin: 1, peopleMax: 3, tastes: ["咸鲜", "辣"], intro: "美式炸鸡 + 辣脆鸡腿堡。", picks: ["辣脆鸡腿堡 38", "鸡块 6 块 26", "三角薯饼 12"], couponHint: "App 30-8 / 70-20", calorieHint: "套餐约 900 kcal", citySpread: "一二线", scenes: ["一人食", "朋友聚会"] },
    { id: "chickenking", name: "派乐汉堡", emoji: "🍔", gradient: ["#e63a32", "#7d1110"], category: "汉堡炸鸡", budgetMin: 12, budgetMax: 35, peopleMin: 1, peopleMax: 2, tastes: ["咸鲜"], intro: "三四线常见，便宜大份。", picks: ["儿童套餐 12", "鸡米花全家桶 38"], couponHint: "App 满 20-6", calorieHint: "套餐 650 kcal", citySpread: "全国", scenes: ["一人食", "工作餐"] },
    { id: "uncle-li-burger", name: "贝克汉堡", emoji: "🍔", gradient: ["#d54f1d", "#7a280d"], category: "汉堡炸鸡", budgetMin: 13, budgetMax: 30, peopleMin: 1, peopleMax: 2, tastes: ["咸鲜"], intro: "校园周边常见，13.9 鸡腿堡套餐。", picks: ["13.9 鸡腿堡套餐", "脆皮鸡 5 块 22"], couponHint: "美团 9.9 神券", calorieHint: "套餐 700 kcal", citySpread: "全国", scenes: ["一人食", "工作餐"] },
    { id: "real-kungfu", name: "真功夫", emoji: "🍱", gradient: ["#fbb900", "#a06600"], category: "中式快餐", budgetMin: 22, budgetMax: 45, peopleMin: 1, peopleMax: 2, tastes: ["咸鲜"], intro: "南方蒸品快餐，主打 排骨饭。", picks: ["香汁排骨饭 28", "宫保鸡丁饭 26", "原盅老鸡汤 12"], couponHint: "美团 30-8 / 会员日 5 折", calorieHint: "盖饭 600-800 kcal", citySpread: "全国", scenes: ["工作餐"] },
    { id: "country-base", name: "乡村基快餐", emoji: "🍚", gradient: ["#d8281a", "#65120a"], category: "中式快餐", budgetMin: 18, budgetMax: 40, peopleMin: 1, peopleMax: 2, tastes: ["咸鲜", "辣"], intro: "西南覆盖最广的中式快餐。", picks: ["豌豆肥肠饭 22", "辣子鸡套餐 26"], couponHint: "App 双 11 半价", calorieHint: "套餐 700 kcal", citySpread: "全国", scenes: ["工作餐"] },
    { id: "wisdom-kitchen", name: "和合谷", emoji: "🍱", gradient: ["#d62024", "#691013"], category: "中式快餐", budgetMin: 22, budgetMax: 45, peopleMin: 1, peopleMax: 2, tastes: ["咸鲜"], intro: "北方常见，盖浇饭 / 卤肉饭。", picks: ["台式卤肉饭 22", "黑椒牛柳盖饭 28"], couponHint: "美团 25-6", calorieHint: "盖饭 700 kcal", citySpread: "一二线", scenes: ["工作餐"] },
    { id: "yuqun", name: "鱼你在一起", emoji: "🐟", gradient: ["#0099d6", "#005273"], category: "中式快餐", budgetMin: 25, budgetMax: 50, peopleMin: 1, peopleMax: 2, tastes: ["酸辣", "咸鲜"], intro: "酸菜鱼盖饭专门店。", picks: ["金汤酸菜鱼饭 32", "番茄鱼饭 30"], couponHint: "美团 35-10", calorieHint: "盖饭 750 kcal", citySpread: "全国", scenes: ["工作餐"] },
    { id: "tianhetai", name: "田老师红烧肉", emoji: "🍖", gradient: ["#a3361b", "#4a1408"], category: "中式快餐", budgetMin: 18, budgetMax: 35, peopleMin: 1, peopleMax: 2, tastes: ["咸鲜"], intro: "北京老品牌，红烧肉饭出名。", picks: ["红烧肉饭 22", "酸菜肉丝饭 18"], couponHint: "美团 25-7", calorieHint: "盖饭 800 kcal", citySpread: "一二线", scenes: ["工作餐"] },
    { id: "gungho", name: "嘉禾一品", emoji: "🥣", gradient: ["#c1281f", "#601410"], category: "粥早餐", budgetMin: 18, budgetMax: 40, peopleMin: 1, peopleMax: 3, tastes: ["清淡", "咸鲜"], intro: "北方连锁粥铺，养胃首选。", picks: ["皮蛋瘦肉粥 16", "黑米南瓜粥 14"], couponHint: "美团 20-5", calorieHint: "粥 300 kcal", citySpread: "一二线", scenes: ["工作餐"] },
    { id: "li-xian-sheng", name: "李先生牛肉面", emoji: "🍜", gradient: ["#c8231d", "#5e0e0a"], category: "粉面", budgetMin: 20, budgetMax: 40, peopleMin: 1, peopleMax: 2, tastes: ["咸鲜"], intro: "美式中餐变身的牛肉面连锁。", picks: ["招牌红烧牛肉面 28", "酸辣土豆丝盖饭 22"], couponHint: "美团 25-6", calorieHint: "面 600 kcal", citySpread: "一二线", scenes: ["工作餐"] },
    { id: "wenheyou-noodle", name: "和府捞面", emoji: "🍜", gradient: ["#0e1e3c", "#06122a"], category: "粉面", budgetMin: 35, budgetMax: 70, peopleMin: 1, peopleMax: 2, tastes: ["咸鲜"], intro: "中式书房风，单面 30+。", picks: ["草本牛肉煨面 38", "番茄肥牛面 36"], couponHint: "App 满 40-10", calorieHint: "面 650 kcal", citySpread: "一二线", scenes: ["工作餐"] },
    { id: "hefeng", name: "粤式肠粉店", emoji: "🍙", gradient: ["#9c3a14", "#5d1f06"], category: "粉面", budgetMin: 14, budgetMax: 30, peopleMin: 1, peopleMax: 2, tastes: ["咸鲜"], intro: "广东早餐摊，肠粉 + 例汤。", picks: ["招牌肠粉 14", "牛肉肠粉 18"], couponHint: "外卖配送费高，自取省", calorieHint: "肠粉 380 kcal", citySpread: "全国", scenes: ["工作餐"] },
    { id: "chongqing-noodle", name: "重庆小面 连锁", emoji: "🌶️", gradient: ["#d72e1c", "#65140d"], category: "粉面", budgetMin: 12, budgetMax: 28, peopleMin: 1, peopleMax: 2, tastes: ["辣", "麻辣"], intro: "正宗川渝小面，麻辣鲜香。", picks: ["招牌小面 12", "豌杂面 16", "凉面 12"], couponHint: "美团 15-3", calorieHint: "小面 480 kcal", citySpread: "全国", scenes: ["工作餐", "深夜"] },
    { id: "yunnan-mixian", name: "云南小锅米线", emoji: "🍲", gradient: ["#9e2925", "#4d130f"], category: "粉面", budgetMin: 18, budgetMax: 35, peopleMin: 1, peopleMax: 2, tastes: ["咸鲜"], intro: "云南过桥米线变体，常见连锁。", picks: ["小锅米线 18", "鲜肉米线 22"], couponHint: "美团 20-5", calorieHint: "米线 500 kcal", citySpread: "一二线", scenes: ["工作餐"] },
    { id: "guizhou-niu-rou-fen", name: "贵州牛肉粉", emoji: "🍜", gradient: ["#a52f15", "#52160a"], category: "粉面", budgetMin: 18, budgetMax: 35, peopleMin: 1, peopleMax: 2, tastes: ["咸鲜", "酸辣"], intro: "贵州花溪牛肉粉为代表。", picks: ["原汤牛肉粉 22", "酸汤牛肉粉 24"], couponHint: "美团 25-5", calorieHint: "粉 550 kcal", citySpread: "一二线", scenes: ["工作餐"] },
    { id: "wuhan-rgm", name: "武汉热干面 连锁", emoji: "🍝", gradient: ["#ba2a18", "#5d160c"], category: "粉面", budgetMin: 8, budgetMax: 18, peopleMin: 1, peopleMax: 2, tastes: ["咸鲜"], intro: "蔡林记式热干面 早餐刚需。", picks: ["热干面 8", "三鲜豆皮 12"], couponHint: "外卖凑早餐券 3-1", calorieHint: "热干面 480 kcal", citySpread: "全国", scenes: ["工作餐"] },
    { id: "guilin-fen", name: "桂林米粉 连锁", emoji: "🍲", gradient: ["#b22b15", "#4f110a"], category: "粉面", budgetMin: 12, budgetMax: 28, peopleMin: 1, peopleMax: 2, tastes: ["咸鲜"], intro: "卤水米粉 + 锅烧组合。", picks: ["三宝米粉 18", "卤味拼盘 12"], couponHint: "美团 15-4", calorieHint: "粉 480 kcal", citySpread: "全国", scenes: ["工作餐"] },
    { id: "heytea", name: "喜茶", emoji: "🧋", gradient: ["#1c1c1c", "#000"], category: "奶茶饮品", budgetMin: 16, budgetMax: 36, peopleMin: 1, peopleMax: 4, tastes: ["甜"], intro: "招牌芝士现泡茶，门店覆盖广。", picks: ["多肉葡萄 22", "芝芝芒芒 22"], couponHint: "App 第二杯半价", calorieHint: "1 杯 250-380 kcal", citySpread: "一二线", scenes: ["下午茶", "朋友聚会"] },
    { id: "naixue", name: "奈雪的茶", emoji: "🥤", gradient: ["#cc7e3e", "#5b3815"], category: "奶茶饮品", budgetMin: 18, budgetMax: 38, peopleMin: 1, peopleMax: 4, tastes: ["甜"], intro: "茶 + 软欧包 双拳头。", picks: ["霸气橙子 22", "魔芋葡萄 19"], couponHint: "App 一周一杯 9.9", calorieHint: "1 杯 280 kcal", citySpread: "一二线", scenes: ["下午茶"] },
    { id: "guming", name: "古茗", emoji: "🍵", gradient: ["#1f6d52", "#0c3220"], category: "奶茶饮品", budgetMin: 9, budgetMax: 22, peopleMin: 1, peopleMax: 4, tastes: ["甜"], intro: "下沉市场覆盖最广。", picks: ["云顶葡萄 14", "杨枝甘露 13"], couponHint: "App 满 30-8", calorieHint: "1 杯 250 kcal", citySpread: "全国", scenes: ["下午茶"] },
    { id: "mixue", name: "蜜雪冰城", emoji: "🍦", gradient: ["#e0231a", "#7e0e09"], category: "奶茶饮品", budgetMin: 4, budgetMax: 15, peopleMin: 1, peopleMax: 6, tastes: ["甜"], intro: "你爱我我爱你，便宜量大。", picks: ["柠檬水 4", "圣代 5", "棒打鲜橙 8"], couponHint: "无需券就便宜", calorieHint: "1 杯 200 kcal", citySpread: "全国", scenes: ["下午茶"] },
    { id: "shanghai-auntie", name: "沪上阿姨", emoji: "🥤", gradient: ["#7d3a14", "#3a1808"], category: "奶茶饮品", budgetMin: 10, budgetMax: 22, peopleMin: 1, peopleMax: 3, tastes: ["甜"], intro: "现煮血糯米 + 五谷杂粮。", picks: ["血糯米奶茶 14", "杨枝甘露 16"], couponHint: "App 满 25-6", calorieHint: "1 杯 350 kcal", citySpread: "全国", scenes: ["下午茶"] },
    { id: "tianlala", name: "甜啦啦", emoji: "🥤", gradient: ["#e63360", "#7d182f"], category: "奶茶饮品", budgetMin: 5, budgetMax: 15, peopleMin: 1, peopleMax: 4, tastes: ["甜"], intro: "下沉性价比奶茶。", picks: ["1 桶水果茶 8", "古早奶茶 6"], couponHint: "无需券", calorieHint: "1 杯 300 kcal", citySpread: "全国", scenes: ["下午茶"] },
    { id: "yidiandian", name: "一点点", emoji: "🧋", gradient: ["#b8531c", "#52250b"], category: "奶茶饮品", budgetMin: 12, budgetMax: 22, peopleMin: 1, peopleMax: 3, tastes: ["甜"], intro: "经典波霸 / 阿华田。", picks: ["波霸奶茶 14", "阿华田 18"], couponHint: "美团 20-3", calorieHint: "1 杯 320 kcal", citySpread: "全国", scenes: ["下午茶"] },
    { id: "mxbc", name: "茶颜悦色", emoji: "🍵", gradient: ["#345f4a", "#1a3024"], category: "奶茶饮品", budgetMin: 14, budgetMax: 22, peopleMin: 1, peopleMax: 3, tastes: ["甜"], intro: "湖南起家，幽兰拿铁是招牌。", picks: ["幽兰拿铁 18", "声声乌龙 16"], couponHint: "暂无大额券", calorieHint: "1 杯 320 kcal", citySpread: "高线", scenes: ["下午茶"] },
    { id: "coco", name: "CoCo 都可", emoji: "🥤", gradient: ["#ff6a13", "#7d3008"], category: "奶茶饮品", budgetMin: 10, budgetMax: 22, peopleMin: 1, peopleMax: 3, tastes: ["甜"], intro: "经典珍珠奶茶，国民选择。", picks: ["珍珠奶茶 14", "三兄弟 16"], couponHint: "美团 25-5", calorieHint: "1 杯 320 kcal", citySpread: "全国", scenes: ["下午茶"] },
    { id: "manner", name: "Manner Coffee", emoji: "☕", gradient: ["#1d3327", "#0c1a13"], category: "茶饮咖啡", budgetMin: 15, budgetMax: 30, peopleMin: 1, peopleMax: 2, tastes: ["甜", "咸鲜"], intro: "10 元拿铁起步，自带杯减 5。", picks: ["拿铁 15", "桂花拿铁 20"], couponHint: "自带杯 -5 元", calorieHint: "1 杯 110 kcal", citySpread: "一二线", scenes: ["工作餐", "下午茶"] },
    { id: "tims", name: "Tim Hortons", emoji: "🍩", gradient: ["#d51c2a", "#5b0c12"], category: "茶饮咖啡", budgetMin: 18, budgetMax: 35, peopleMin: 1, peopleMax: 2, tastes: ["甜", "咸鲜"], intro: "加拿大咖啡 + 甜甜圈。", picks: ["招牌拿铁 18", "焙果三明治 22"], couponHint: "App 满 25-7", calorieHint: "1 杯 130 kcal", citySpread: "一二线", scenes: ["工作餐"] },
    { id: "starbucks", name: "星巴克", emoji: "🧋", gradient: ["#006241", "#00321f"], category: "茶饮咖啡", budgetMin: 28, budgetMax: 50, peopleMin: 1, peopleMax: 2, tastes: ["甜", "咸鲜"], intro: "国民咖啡天花板。", picks: ["拿铁 32", "焦糖玛奇朵 38"], couponHint: "App 79-50 卡", calorieHint: "1 杯 180 kcal", citySpread: "全国", scenes: ["下午茶"] },
    { id: "kudi", name: "库迪咖啡", emoji: "☕", gradient: ["#7a3a14", "#3d1c0a"], category: "茶饮咖啡", budgetMin: 8, budgetMax: 20, peopleMin: 1, peopleMax: 3, tastes: ["甜"], intro: "瑞幸老板二次创业，9.9 大单。", picks: ["生椰拿铁 9.9", "丝绒拿铁 9.9"], couponHint: "几乎一直 9.9", calorieHint: "1 杯 130 kcal", citySpread: "全国", scenes: ["工作餐"] },
    { id: "luckin-2", name: "瑞幸茶", emoji: "🧋", gradient: ["#0e3b85", "#06173a"], category: "茶饮咖啡", budgetMin: 9, budgetMax: 20, peopleMin: 1, peopleMax: 3, tastes: ["甜"], intro: "瑞幸的茶饮线，新品多。", picks: ["茉莉雪芽 9.9", "酱香拿铁 19"], couponHint: "App 4.8 折券", calorieHint: "1 杯 200 kcal", citySpread: "全国", scenes: ["下午茶"] },
    { id: "kfk", name: "Costa", emoji: "☕", gradient: ["#7a233a", "#380c1a"], category: "茶饮咖啡", budgetMin: 25, budgetMax: 45, peopleMin: 1, peopleMax: 2, tastes: ["甜"], intro: "英伦风咖啡。", picks: ["拿铁 28", "摩卡 32"], couponHint: "美团 30-8", calorieHint: "1 杯 160 kcal", citySpread: "一二线", scenes: ["下午茶"] },
    { id: "xiaolongkan", name: "小龙坎火锅外送", emoji: "🍲", gradient: ["#bc1f1a", "#5b0d0b"], category: "火锅麻辣烫", budgetMin: 60, budgetMax: 200, peopleMin: 2, peopleMax: 4, tastes: ["辣", "麻辣"], intro: "川派老火锅外送。", picks: ["毛肚 38", "鸭血 22", "牛肉 48"], couponHint: "京东到家 满 200-50", calorieHint: "人均 800 kcal", citySpread: "一二线", scenes: ["家庭聚餐", "朋友聚会"] },
    { id: "tanyu", name: "谭鸭血", emoji: "🦆", gradient: ["#9d1a16", "#48090a"], category: "火锅麻辣烫", budgetMin: 80, budgetMax: 200, peopleMin: 2, peopleMax: 4, tastes: ["辣", "麻辣"], intro: "鸭血特色火锅。", picks: ["鸭血 22", "毛肚 38"], couponHint: "美团到家 满 200-40", calorieHint: "人均 850 kcal", citySpread: "一二线", scenes: ["朋友聚会"] },
    { id: "zhangliangmlt", name: "张亮麻辣烫", emoji: "🥘", gradient: ["#c12121", "#5b0d0d"], category: "火锅麻辣烫", budgetMin: 18, budgetMax: 45, peopleMin: 1, peopleMax: 3, tastes: ["辣", "麻辣"], intro: "全国最广覆盖的麻辣烫。", picks: ["素菜拼盘 12", "牛肉丸 6/串"], couponHint: "美团 30-8", calorieHint: "1 份 600 kcal", citySpread: "全国", scenes: ["一人食", "工作餐"] },
    { id: "jihaocan", name: "吉野家", emoji: "🐂", gradient: ["#ee831c", "#7d3e0a"], category: "中式快餐", budgetMin: 25, budgetMax: 45, peopleMin: 1, peopleMax: 2, tastes: ["咸鲜"], intro: "日式牛肉饭连锁。", picks: ["牛肉饭 28", "鳗鱼饭 35"], couponHint: "美团 30-8", calorieHint: "盖饭 700 kcal", citySpread: "一二线", scenes: ["工作餐"] },
    { id: "jiumaojiu-noodle", name: "九毛九 粉面", emoji: "🍜", gradient: ["#ce2b1c", "#5d130d"], category: "粉面", budgetMin: 30, budgetMax: 60, peopleMin: 1, peopleMax: 3, tastes: ["咸鲜", "酸辣"], intro: "山西刀削面 + 西北面食。", picks: ["招牌大刀面 34", "肉夹馍 18"], couponHint: "美团 35-10", calorieHint: "面 700 kcal", citySpread: "一二线", scenes: ["工作餐"] },
    { id: "qing-feng-baozi", name: "庆丰包子铺", emoji: "🥟", gradient: ["#9b2522", "#4a1110"], category: "饺子小笼", budgetMin: 12, budgetMax: 28, peopleMin: 1, peopleMax: 2, tastes: ["咸鲜"], intro: "北京老字号包子。", picks: ["猪肉大葱 6", "三鲜包 7"], couponHint: "美团 18-3", calorieHint: "包子 280 kcal", citySpread: "一二线", scenes: ["工作餐"] },
    { id: "xishaoye", name: "西少爷肉夹馍", emoji: "🌯", gradient: ["#d4361b", "#621509"], category: "饺子小笼", budgetMin: 18, budgetMax: 35, peopleMin: 1, peopleMax: 2, tastes: ["咸鲜"], intro: "陕西肉夹馍 + 凉皮。", picks: ["腊汁肉夹馍 18", "凉皮 12"], couponHint: "美团 25-7", calorieHint: "1 份 600 kcal", citySpread: "一二线", scenes: ["工作餐"] },
    { id: "yes-dumpling", name: "喜家德", emoji: "🥟", gradient: ["#d6291f", "#601510"], category: "饺子小笼", budgetMin: 25, budgetMax: 50, peopleMin: 1, peopleMax: 3, tastes: ["咸鲜"], intro: "东北水饺连锁。", picks: ["虾仁三鲜 38", "猪肉白菜 22"], couponHint: "美团 35-8", calorieHint: "饺子 600 kcal", citySpread: "一二线", scenes: ["工作餐", "家庭聚餐"] },
    { id: "dingtaifeng", name: "鼎泰丰", emoji: "🥟", gradient: ["#a31c1c", "#480a0a"], category: "饺子小笼", budgetMin: 70, budgetMax: 150, peopleMin: 1, peopleMax: 4, tastes: ["咸鲜"], intro: "小笼包国民地标，价位偏高。", picks: ["小笼包 78", "蒸饺 65"], couponHint: "团购套餐更划算", calorieHint: "1 笼 320 kcal", citySpread: "高线", scenes: ["家庭聚餐"] },
    { id: "fenglutang", name: "丰泉包子", emoji: "🥟", gradient: ["#a32621", "#481012"], category: "饺子小笼", budgetMin: 12, budgetMax: 25, peopleMin: 1, peopleMax: 2, tastes: ["咸鲜"], intro: "上海早餐小笼连锁。", picks: ["鲜肉小笼 16", "粢饭团 6"], couponHint: "外卖 15-3", calorieHint: "1 份 380 kcal", citySpread: "一二线", scenes: ["工作餐"] },
    { id: "muslimk", name: "回味烤肉", emoji: "🍢", gradient: ["#c2301c", "#5e120c"], category: "烤肉烧烤", budgetMin: 60, budgetMax: 180, peopleMin: 2, peopleMax: 5, tastes: ["咸鲜", "辣"], intro: "回民烧烤，主打牛羊肉。", picks: ["羊肉串 5/串", "烤腰子 12/串"], couponHint: "美团 100-25", calorieHint: "人均 800 kcal", citySpread: "全国", scenes: ["朋友聚会", "深夜"] },
    { id: "hanlim", name: "汉拿山", emoji: "🥩", gradient: ["#a31c20", "#4a0a0d"], category: "烤肉烧烤", budgetMin: 80, budgetMax: 150, peopleMin: 2, peopleMax: 4, tastes: ["咸鲜"], intro: "韩式烤肉外送套餐。", picks: ["双人套餐 158", "招牌牛肋骨 68"], couponHint: "美团 200-40", calorieHint: "人均 900 kcal", citySpread: "一二线", scenes: ["朋友聚会"] },
    { id: "cuijianghe", name: "崔记烤肉", emoji: "🍖", gradient: ["#9d2c1c", "#451209"], category: "烤肉烧烤", budgetMin: 50, budgetMax: 130, peopleMin: 2, peopleMax: 4, tastes: ["咸鲜"], intro: "东北烤串老店连锁。", picks: ["羊肉串 4/串", "肉筋 5/串"], couponHint: "美团 100-25", calorieHint: "人均 750 kcal", citySpread: "一二线", scenes: ["朋友聚会", "深夜"] },
    { id: "muwoo", name: "牧之初心", emoji: "🥩", gradient: ["#7a1e16", "#370b08"], category: "烤肉烧烤", budgetMin: 100, budgetMax: 220, peopleMin: 2, peopleMax: 4, tastes: ["咸鲜"], intro: "潮汕牛肉到日式烤肉的转身。", picks: ["和牛拼盘 168", "招牌套餐 218"], couponHint: "美团 200-50", calorieHint: "人均 1100 kcal", citySpread: "高线", scenes: ["朋友聚会"] },
    { id: "norikase", name: "鳗鱼食堂", emoji: "🍱", gradient: ["#8a3a14", "#3a1707"], category: "海鲜日料", budgetMin: 35, budgetMax: 65, peopleMin: 1, peopleMax: 2, tastes: ["咸鲜"], intro: "日式鳗鱼饭连锁。", picks: ["招牌鳗鱼饭 38", "亲子丼 32"], couponHint: "美团 50-15", calorieHint: "盖饭 800 kcal", citySpread: "一二线", scenes: ["工作餐"] },
    { id: "vsushi", name: "村上一屋", emoji: "🍣", gradient: ["#1a3324", "#0a1a12"], category: "海鲜日料", budgetMin: 60, budgetMax: 150, peopleMin: 1, peopleMax: 4, tastes: ["咸鲜"], intro: "日式寿司居酒屋外送。", picks: ["人气拼盘 88", "鳗鱼饭 38"], couponHint: "美团 100-25", calorieHint: "人均 900 kcal", citySpread: "一二线", scenes: ["朋友聚会"] },
    { id: "norisushi", name: "争鲜回转", emoji: "🍣", gradient: ["#cf1d2a", "#600d12"], category: "海鲜日料", budgetMin: 50, budgetMax: 120, peopleMin: 1, peopleMax: 3, tastes: ["咸鲜"], intro: "回转寿司平价。", picks: ["人气 12 件 88", "三文鱼握 28"], couponHint: "美团 100-30", calorieHint: "1 份 700 kcal", citySpread: "一二线", scenes: ["朋友聚会"] },
    { id: "wagas", name: "Wagas", emoji: "🥗", gradient: ["#0a8244", "#053a1f"], category: "健康轻食", budgetMin: 45, budgetMax: 90, peopleMin: 1, peopleMax: 2, tastes: ["清淡", "热量低"], intro: "白领轻食天花板。", picks: ["藜麦烤鸡碗 58", "牛油果三明治 42"], couponHint: "美团 60-15", calorieHint: "套餐 500 kcal", citySpread: "高线", scenes: ["工作餐"] },
    { id: "saladays", name: "好色派沙拉", emoji: "🥗", gradient: ["#12783c", "#06381d"], category: "健康轻食", budgetMin: 35, budgetMax: 65, peopleMin: 1, peopleMax: 2, tastes: ["清淡", "热量低"], intro: "国产轻食连锁。", picks: ["招牌鸡胸沙拉 42", "藜麦碗 38"], couponHint: "App 40-10", calorieHint: "1 份 420 kcal", citySpread: "一二线", scenes: ["工作餐"] },
    { id: "shuxianggui", name: "Sweetheart 沙拉", emoji: "🥗", gradient: ["#a3c93f", "#516216"], category: "健康轻食", budgetMin: 30, budgetMax: 55, peopleMin: 1, peopleMax: 2, tastes: ["清淡", "热量低"], intro: "校园 / 写字楼周边。", picks: ["素食沙拉 32", "鸡胸藜麦 36"], couponHint: "美团 35-7", calorieHint: "1 份 380 kcal", citySpread: "全国", scenes: ["工作餐"] },
    { id: "ohto", name: "OHTO 鸡胸", emoji: "🐔", gradient: ["#0d6b3d", "#04321b"], category: "健康轻食", budgetMin: 25, budgetMax: 50, peopleMin: 1, peopleMax: 1, tastes: ["热量低"], intro: "增肌减脂常见。", picks: ["鸡胸碗 32", "牛胸肉碗 38"], couponHint: "App 40-10", calorieHint: "1 份 400 kcal", citySpread: "一二线", scenes: ["工作餐"] },
    { id: "85cafe", name: "85°C", emoji: "🥐", gradient: ["#7a3a14", "#3a1808"], category: "面包烘焙", budgetMin: 12, budgetMax: 35, peopleMin: 1, peopleMax: 3, tastes: ["甜"], intro: "台式面包 + 海盐咖啡。", picks: ["海盐咖啡 14", "葡式蛋挞 6"], couponHint: "美团 30-7", calorieHint: "1 件 280 kcal", citySpread: "全国", scenes: ["下午茶"] },
    { id: "paris-baguette", name: "巴黎贝甜", emoji: "🥖", gradient: ["#2050b8", "#0d1f4a"], category: "面包烘焙", budgetMin: 18, budgetMax: 40, peopleMin: 1, peopleMax: 3, tastes: ["甜", "咸鲜"], intro: "韩资连锁面包。", picks: ["可颂 12", "三明治 18"], couponHint: "美团 30-8", calorieHint: "1 件 280 kcal", citySpread: "一二线", scenes: ["工作餐", "下午茶"] },
    { id: "baoshifu", name: "鲍师傅糕点", emoji: "🥮", gradient: ["#a3211a", "#480c0a"], category: "面包烘焙", budgetMin: 14, budgetMax: 35, peopleMin: 1, peopleMax: 4, tastes: ["甜", "咸鲜"], intro: "肉松小贝排队王。", picks: ["肉松小贝 6.8", "海苔小贝 6.8"], couponHint: "暂无券，门店排队", calorieHint: "1 颗 200 kcal", citySpread: "一二线", scenes: ["下午茶"] },
    { id: "weidao", name: "味多美", emoji: "🥯", gradient: ["#a52d20", "#481209"], category: "面包烘焙", budgetMin: 14, budgetMax: 30, peopleMin: 1, peopleMax: 3, tastes: ["甜"], intro: "北京老字号烘焙。", picks: ["奶油面包 14", "招牌泡芙 9"], couponHint: "美团 25-5", calorieHint: "1 件 280 kcal", citySpread: "一二线", scenes: ["下午茶"] },
    { id: "yibukala", name: "原麦山丘", emoji: "🥖", gradient: ["#6b3a18", "#321709"], category: "面包烘焙", budgetMin: 22, budgetMax: 50, peopleMin: 1, peopleMax: 3, tastes: ["甜"], intro: "软欧包潮流先驱。", picks: ["榴莲软欧 32", "葡萄软欧 24"], couponHint: "美团 50-12", calorieHint: "1 件 320 kcal", citySpread: "一二线", scenes: ["下午茶"] },
    { id: "sweet-yi", name: "许留山", emoji: "🍧", gradient: ["#c44a3a", "#5e1a0e"], category: "甜品下午茶", budgetMin: 22, budgetMax: 45, peopleMin: 1, peopleMax: 3, tastes: ["甜"], intro: "港式甜品。", picks: ["杨枝甘露 22", "芒果布丁 18"], couponHint: "美团 30-8", calorieHint: "1 份 380 kcal", citySpread: "高线", scenes: ["下午茶"] },
    { id: "haiyu", name: "满记甜品", emoji: "🍮", gradient: ["#a8351c", "#48150a"], category: "甜品下午茶", budgetMin: 22, budgetMax: 45, peopleMin: 1, peopleMax: 3, tastes: ["甜"], intro: "港式甜品老牌。", picks: ["榴莲忘返 32", "杨枝甘露 26"], couponHint: "美团 50-15", calorieHint: "1 份 380 kcal", citySpread: "高线", scenes: ["下午茶"] },
    { id: "freshlemon", name: "鲜柠檬茶", emoji: "🍋", gradient: ["#cfa829", "#5b4710"], category: "小吃零嘴", budgetMin: 8, budgetMax: 22, peopleMin: 1, peopleMax: 3, tastes: ["甜"], intro: "国民鲜柠茶。", picks: ["手打柠檬茶 12", "金桔柠檬 10"], couponHint: "美团 15-4", calorieHint: "1 杯 80 kcal", citySpread: "全国", scenes: ["下午茶"] },
    { id: "haohaoji", name: "好好吃肉夹馍", emoji: "🌯", gradient: ["#a52f1c", "#491209"], category: "小吃零嘴", budgetMin: 8, budgetMax: 22, peopleMin: 1, peopleMax: 2, tastes: ["咸鲜"], intro: "便利店常见小吃。", picks: ["肉夹馍 12", "凉皮 10"], couponHint: "美团 15-3", calorieHint: "1 份 480 kcal", citySpread: "全国", scenes: ["工作餐"] },
    { id: "zb-duck", name: "周黑鸭", emoji: "🦆", gradient: ["#1a1a1a", "#000"], category: "小吃零嘴", budgetMin: 22, budgetMax: 60, peopleMin: 1, peopleMax: 4, tastes: ["辣", "咸鲜"], intro: "卤味国民品牌。", picks: ["鸭脖 38", "鸭翅 32"], couponHint: "美团 50-12", calorieHint: "1 份 350 kcal", citySpread: "全国", scenes: ["朋友聚会", "深夜"] },
    { id: "jue-wei", name: "绝味鸭脖", emoji: "🦆", gradient: ["#a91d1f", "#480c0d"], category: "小吃零嘴", budgetMin: 18, budgetMax: 50, peopleMin: 1, peopleMax: 4, tastes: ["辣", "咸鲜"], intro: "卤味连锁。", picks: ["鸭脖 26", "鸭翅 22"], couponHint: "美团 50-12", calorieHint: "1 份 350 kcal", citySpread: "全国", scenes: ["朋友聚会", "深夜"] },
    { id: "liuxiang", name: "留香轩卤味", emoji: "🍢", gradient: ["#b14021", "#501408"], category: "小吃零嘴", budgetMin: 12, budgetMax: 35, peopleMin: 1, peopleMax: 3, tastes: ["咸鲜"], intro: "潮汕卤水。", picks: ["卤鹅 38", "卤鸡爪 18"], couponHint: "美团 25-5", calorieHint: "1 份 320 kcal", citySpread: "全国", scenes: ["朋友聚会"] },
    { id: "sjg-skewers", name: "夹克的虾", emoji: "🦐", gradient: ["#df3a23", "#681708"], category: "小吃零嘴", budgetMin: 35, budgetMax: 80, peopleMin: 1, peopleMax: 3, tastes: ["辣", "咸鲜"], intro: "麻辣小龙虾外卖。", picks: ["蒜蓉小龙虾 68", "麻辣小龙虾 78"], couponHint: "美团 80-20", calorieHint: "1 份 600 kcal", citySpread: "一二线", scenes: ["朋友聚会", "深夜"] },
    { id: "wuyu", name: "捞王", emoji: "🍲", gradient: ["#a52f1c", "#48150a"], category: "火锅麻辣烫", budgetMin: 80, budgetMax: 200, peopleMin: 2, peopleMax: 4, tastes: ["清淡", "咸鲜"], intro: "台式胡椒猪肚锅。", picks: ["招牌猪肚鸡 158", "胡椒虾 78"], couponHint: "美团 200-40", calorieHint: "人均 800 kcal", citySpread: "高线", scenes: ["家庭聚餐"] },
    { id: "bn-rice", name: "本宫的茶", emoji: "🍵", gradient: ["#5d4220", "#2a1c0c"], category: "奶茶饮品", budgetMin: 9, budgetMax: 20, peopleMin: 1, peopleMax: 3, tastes: ["甜"], intro: "下沉奶茶店。", picks: ["招牌奶茶 9.9", "椰椰布丁 12"], couponHint: "无需券", calorieHint: "1 杯 280 kcal", citySpread: "全国", scenes: ["下午茶"] },
    { id: "supreme", name: "Supreme 米线", emoji: "🍜", gradient: ["#a32925", "#481010"], category: "粉面", budgetMin: 18, budgetMax: 35, peopleMin: 1, peopleMax: 2, tastes: ["咸鲜"], intro: "云南风米线连锁。", picks: ["招牌米线 22", "鸡丝米线 18"], couponHint: "美团 25-5", calorieHint: "米线 480 kcal", citySpread: "全国", scenes: ["工作餐"] },
    { id: "shaxi", name: "上海小馄饨", emoji: "🥟", gradient: ["#b03a18", "#491708"], category: "饺子小笼", budgetMin: 12, budgetMax: 25, peopleMin: 1, peopleMax: 2, tastes: ["清淡"], intro: "南方早餐刚需。", picks: ["鲜肉小馄饨 14", "三鲜馄饨 16"], couponHint: "外卖凑早餐券", calorieHint: "1 碗 380 kcal", citySpread: "一二线", scenes: ["工作餐"] },
    { id: "tangsanjie", name: "唐三镜烧烤", emoji: "🍖", gradient: ["#993418", "#42130a"], category: "烤肉烧烤", budgetMin: 50, budgetMax: 120, peopleMin: 2, peopleMax: 4, tastes: ["咸鲜"], intro: "南方烧烤连锁。", picks: ["招牌烤鱼 88", "羊肉串 4/串"], couponHint: "美团 100-25", calorieHint: "人均 800 kcal", citySpread: "全国", scenes: ["朋友聚会", "深夜"] },
    { id: "yan-ji-old-rice", name: "言几又粥铺", emoji: "🥣", gradient: ["#a72820", "#42100c"], category: "粥早餐", budgetMin: 14, budgetMax: 30, peopleMin: 1, peopleMax: 3, tastes: ["清淡"], intro: "粤式粥铺连锁。", picks: ["艇仔粥 18", "皮蛋瘦肉粥 16"], couponHint: "美团 20-5", calorieHint: "粥 320 kcal", citySpread: "全国", scenes: ["工作餐"] },
    { id: "longyi", name: "龙湾烧腊", emoji: "🦆", gradient: ["#7e1f1d", "#33080a"], category: "中式快餐", budgetMin: 22, budgetMax: 50, peopleMin: 1, peopleMax: 3, tastes: ["咸鲜"], intro: "粤式烧腊连锁。", picks: ["叉烧饭 28", "烧鸭饭 32"], couponHint: "美团 35-10", calorieHint: "盖饭 800 kcal", citySpread: "一二线", scenes: ["工作餐"] },
    { id: "xc-stew", name: "新荣记 家常 外送版", emoji: "🍲", gradient: ["#7a1818", "#330808"], category: "中式快餐", budgetMin: 35, budgetMax: 80, peopleMin: 1, peopleMax: 3, tastes: ["清淡"], intro: "高品质外送家常菜，价位偏高。", picks: ["黄鱼烧豆腐 78", "葱烧海参 158"], couponHint: "套餐 ≥200 立减 30", calorieHint: "1 份 600 kcal", citySpread: "高线", scenes: ["家庭聚餐"] },
    { id: "xianhe-zheng-pork", name: "西贝莜面村", emoji: "🥟", gradient: ["#9a261b", "#42100b"], category: "中式快餐", budgetMin: 35, budgetMax: 80, peopleMin: 1, peopleMax: 3, tastes: ["咸鲜"], intro: "西北菜国民连锁。", picks: ["招牌莜面 38", "牛大骨 88"], couponHint: "美团 60-15", calorieHint: "1 份 750 kcal", citySpread: "全国", scenes: ["家庭聚餐"] },
    { id: "yusan", name: "鱼三宝重庆烤鱼", emoji: "🐟", gradient: ["#a31a1f", "#48090d"], category: "海鲜日料", budgetMin: 60, budgetMax: 150, peopleMin: 2, peopleMax: 4, tastes: ["辣", "咸鲜"], intro: "重庆烤鱼连锁。", picks: ["香辣烤鱼 88", "豆腐烤鱼 78"], couponHint: "美团 150-30", calorieHint: "人均 900 kcal", citySpread: "一二线", scenes: ["朋友聚会"] },
    { id: "wenheyou-snack", name: "文和友 长沙小吃", emoji: "🦐", gradient: ["#7a1715", "#310708"], category: "小吃零嘴", budgetMin: 35, budgetMax: 80, peopleMin: 1, peopleMax: 3, tastes: ["辣", "咸鲜"], intro: "长沙宵夜文化代表。", picks: ["油爆虾 68", "口味虾 88"], couponHint: "美团 80-20", calorieHint: "1 份 700 kcal", citySpread: "高线", scenes: ["朋友聚会", "深夜"] },
    { id: "huangji-chicken", name: "黄记煌焖锅", emoji: "🍲", gradient: ["#cb2820", "#5d100c"], category: "中式快餐", budgetMin: 60, budgetMax: 130, peopleMin: 2, peopleMax: 4, tastes: ["咸鲜"], intro: "焖锅快餐外送。", picks: ["三汁焖鸡 88", "海鲜焖锅 128"], couponHint: "美团 100-25", calorieHint: "人均 850 kcal", citySpread: "全国", scenes: ["家庭聚餐"] },
    { id: "fish-xiaobenghai", name: "小肥羊外送", emoji: "🐑", gradient: ["#a52e21", "#48140e"], category: "火锅麻辣烫", budgetMin: 80, budgetMax: 180, peopleMin: 2, peopleMax: 4, tastes: ["咸鲜"], intro: "羊肉火锅外送。", picks: ["羊肉拼盘 78", "招牌锅底 38"], couponHint: "美团 200-50", calorieHint: "人均 850 kcal", citySpread: "一二线", scenes: ["家庭聚餐"] },
    { id: "xiyangyang", name: "犇师傅 牛肉面", emoji: "🍜", gradient: ["#9d1d18", "#42090a"], category: "粉面", budgetMin: 18, budgetMax: 40, peopleMin: 1, peopleMax: 2, tastes: ["咸鲜"], intro: "兰州牛肉面新派。", picks: ["招牌牛肉面 26", "番茄牛肉面 28"], couponHint: "美团 30-8", calorieHint: "1 碗 600 kcal", citySpread: "全国", scenes: ["工作餐"] },
    { id: "shanghai-laodong", name: "上海老乡饭", emoji: "🍱", gradient: ["#a52d22", "#481509"], category: "中式快餐", budgetMin: 22, budgetMax: 45, peopleMin: 1, peopleMax: 2, tastes: ["咸鲜"], intro: "本帮便当快餐。", picks: ["葱烤排骨饭 28", "黄鱼面 32"], couponHint: "美团 30-7", calorieHint: "盖饭 720 kcal", citySpread: "一二线", scenes: ["工作餐"] },
    { id: "donglaishun", name: "东来顺涮锅外送", emoji: "🐑", gradient: ["#7a1816", "#330709"], category: "火锅麻辣烫", budgetMin: 80, budgetMax: 180, peopleMin: 2, peopleMax: 4, tastes: ["咸鲜"], intro: "京派涮羊肉。", picks: ["手切羊肉 68", "毛肚 38"], couponHint: "美团 200-40", calorieHint: "人均 850 kcal", citySpread: "高线", scenes: ["家庭聚餐"] },
    { id: "yumixiang", name: "玉米香 早餐铺", emoji: "🌽", gradient: ["#cfb118", "#5b4810"], category: "粥早餐", budgetMin: 8, budgetMax: 18, peopleMin: 1, peopleMax: 2, tastes: ["清淡"], intro: "玉米煎饼 + 豆浆。", picks: ["玉米煎饼 8", "黑芝麻豆浆 6"], couponHint: "外卖凑早餐券", calorieHint: "1 份 380 kcal", citySpread: "全国", scenes: ["工作餐"] },
    { id: "youzhi", name: "尤吉私厨", emoji: "🍱", gradient: ["#963b1d", "#421607"], category: "中式快餐", budgetMin: 22, budgetMax: 45, peopleMin: 1, peopleMax: 2, tastes: ["咸鲜"], intro: "外卖私厨连锁。", picks: ["私房牛腩饭 32", "椒麻鸡饭 28"], couponHint: "美团 35-7", calorieHint: "盖饭 760 kcal", citySpread: "一二线", scenes: ["工作餐"] },
    { id: "pizza-marzano", name: "玛尚诺披萨", emoji: "🍕", gradient: ["#9a1d1c", "#42090b"], category: "披萨意面", budgetMin: 50, budgetMax: 110, peopleMin: 1, peopleMax: 4, tastes: ["咸鲜"], intro: "意式手作披萨连锁。", picks: ["玛格丽特 68", "肉酱意面 48"], couponHint: "美团 100-25", calorieHint: "1 份 800 kcal", citySpread: "一二线", scenes: ["朋友聚会"] },
  ];
  const brands: TakeoutBrand[] = tpls.map((t) => ({
    id: t.id, name: t.name, emoji: t.emoji, gradient: t.gradient,
    category: t.category, budgetMin: t.budgetMin, budgetMax: t.budgetMax,
    peopleMin: t.peopleMin, peopleMax: t.peopleMax, tastes: t.tastes,
    intro: t.intro,
    picks: t.picks.map((p) => {
      const m = p.match(/^(.+?)\s+([\d.]+(?:\/串)?(?:\/盘)?)$/);
      if (m) return { name: m[1], price: `约 ${m[2]} 元` };
      return { name: p };
    }),
    couponHint: t.couponHint,
    calorieHint: t.calorieHint,
    citySpread: t.citySpread,
    scenes: t.scenes,
  }));
  // 仍不到 200 则用「品类店铺模板」继续补：每个品类生成 N 家不同区域风格的常见小店
  const fillers: { catKey: TakeoutCategory; emoji: string; gradient: [string, string]; baseName: string; tastes: TakeoutTaste[]; budget: [number, number]; intro: string; picks: string[]; coupon: string; cal: string; scenes: TakeoutBrand["scenes"] }[] = [
    { catKey: "粥早餐", emoji: "🥣", gradient: ["#a32820", "#42100c"], baseName: "粥铺", tastes: ["清淡"], budget: [12, 30], intro: "社区粥铺连锁，皮蛋瘦肉粥 + 油条。", picks: ["皮蛋瘦肉粥 14", "南瓜小米粥 12"], coupon: "美团 18-4", cal: "粥 320 kcal", scenes: ["工作餐"] },
    { catKey: "粉面", emoji: "🍜", gradient: ["#a52d21", "#481509"], baseName: "牛肉面馆", tastes: ["咸鲜"], budget: [16, 32], intro: "周边社区面馆，红烧 / 番茄 / 香辣三选一。", picks: ["招牌牛肉面 22", "番茄牛肉 24"], coupon: "美团 22-5", cal: "1 碗 580 kcal", scenes: ["工作餐"] },
    { catKey: "中式快餐", emoji: "🍱", gradient: ["#a72820", "#421008"], baseName: "盖饭店", tastes: ["咸鲜"], budget: [18, 38], intro: "街边盖饭店连锁，红烧肉 / 鱼香肉丝。", picks: ["鱼香肉丝饭 22", "红烧肉饭 26"], coupon: "美团 25-6", cal: "盖饭 720 kcal", scenes: ["工作餐"] },
    { catKey: "饺子小笼", emoji: "🥟", gradient: ["#9c2620", "#46110d"], baseName: "饺子坊", tastes: ["咸鲜"], budget: [16, 35], intro: "社区饺子铺，速冻+现包混合。", picks: ["猪肉白菜饺 20", "三鲜饺 24"], coupon: "美团 25-5", cal: "饺子 580 kcal", scenes: ["家庭聚餐", "工作餐"] },
    { catKey: "汉堡炸鸡", emoji: "🍔", gradient: ["#cd2620", "#5e0e0c"], baseName: "炸鸡小铺", tastes: ["咸鲜", "油腻"], budget: [12, 30], intro: "便宜炸鸡店，校园周边常见。", picks: ["鸡腿堡 12", "鸡米花 10"], coupon: "美团 15-3", cal: "1 份 750 kcal", scenes: ["一人食", "深夜"] },
    { catKey: "火锅麻辣烫", emoji: "🥘", gradient: ["#a32521", "#46100d"], baseName: "麻辣烫铺", tastes: ["辣", "麻辣"], budget: [18, 40], intro: "社区麻辣烫店，秤重计费。", picks: ["素菜拼盘 12", "牛肉丸 6/串"], coupon: "美团 25-5", cal: "1 份 600 kcal", scenes: ["一人食"] },
    { catKey: "茶饮咖啡", emoji: "☕", gradient: ["#3c1f0a", "#190a04"], baseName: "巷口咖啡", tastes: ["甜"], budget: [12, 28], intro: "社区独立咖啡店连锁。", picks: ["美式 14", "拿铁 18"], coupon: "美团 20-5", cal: "1 杯 130 kcal", scenes: ["下午茶"] },
    { catKey: "奶茶饮品", emoji: "🧋", gradient: ["#a3431f", "#481c0a"], baseName: "奶茶铺", tastes: ["甜"], budget: [9, 22], intro: "下沉奶茶连锁。", picks: ["珍珠奶茶 12", "杨枝甘露 14"], coupon: "美团 15-3", cal: "1 杯 320 kcal", scenes: ["下午茶"] },
    { catKey: "面包烘焙", emoji: "🥐", gradient: ["#7a3a14", "#3a1808"], baseName: "面包小屋", tastes: ["甜"], budget: [12, 30], intro: "周边面包房常见。", picks: ["奶油面包 12", "可颂 9"], coupon: "美团 20-5", cal: "1 件 280 kcal", scenes: ["下午茶"] },
    { catKey: "烤肉烧烤", emoji: "🍢", gradient: ["#a32d1a", "#48140a"], baseName: "夜市烧烤", tastes: ["咸鲜"], budget: [40, 100], intro: "夜市常见烧烤摊，外送版。", picks: ["羊肉串 4/串", "烤翅 12"], coupon: "美团 60-15", cal: "人均 800 kcal", scenes: ["朋友聚会", "深夜"] },
    { catKey: "海鲜日料", emoji: "🍣", gradient: ["#7a1818", "#3a0808"], baseName: "鲜寿司", tastes: ["咸鲜"], budget: [40, 90], intro: "外卖寿司店常见。", picks: ["寿司拼盘 58", "鳗鱼饭 38"], coupon: "美团 60-15", cal: "1 份 750 kcal", scenes: ["朋友聚会"] },
    { catKey: "甜品下午茶", emoji: "🍰", gradient: ["#a83b39", "#48141a"], baseName: "甜品坊", tastes: ["甜"], budget: [22, 50], intro: "下午茶甜品连锁。", picks: ["杨枝甘露 22", "提拉米苏 28"], coupon: "美团 30-8", cal: "1 份 380 kcal", scenes: ["下午茶"] },
    { catKey: "健康轻食", emoji: "🥗", gradient: ["#0d6b3d", "#04321b"], baseName: "轻食实验室", tastes: ["热量低"], budget: [30, 60], intro: "白领轻食外送，写字楼周边。", picks: ["鸡胸藜麦 36", "牛油果碗 42"], coupon: "美团 40-10", cal: "1 份 420 kcal", scenes: ["工作餐"] },
    { catKey: "饭团便当", emoji: "🍙", gradient: ["#a52f1f", "#481509"], baseName: "便当工坊", tastes: ["咸鲜"], budget: [20, 40], intro: "便当外送连锁。", picks: ["招牌便当 28", "烧肉便当 32"], coupon: "美团 30-8", cal: "便当 720 kcal", scenes: ["工作餐"] },
    { catKey: "披萨意面", emoji: "🍕", gradient: ["#a52d20", "#481509"], baseName: "披萨工坊", tastes: ["咸鲜"], budget: [35, 75], intro: "便利披萨连锁。", picks: ["9 寸夏威夷 42", "意面 32"], coupon: "美团 60-15", cal: "1 份 850 kcal", scenes: ["朋友聚会"] },
    { catKey: "小吃零嘴", emoji: "🦆", gradient: ["#a32625", "#481011"], baseName: "卤味坊", tastes: ["咸鲜", "辣"], budget: [18, 50], intro: "社区卤味铺。", picks: ["鸭脖 28", "鸡爪 18"], coupon: "美团 30-7", cal: "1 份 320 kcal", scenes: ["朋友聚会", "深夜"] },
  ];
  const REGIONS = ["北方", "南方", "华南", "华东", "西南", "西北", "东北", "华中"];
  for (const f of fillers) {
    for (let i = 0; i < REGIONS.length; i++) {
      const r = REGIONS[i];
      brands.push({
        id: `tpl-${f.catKey}-${i}`,
        name: `${r}${f.baseName}`,
        emoji: f.emoji,
        gradient: f.gradient,
        category: f.catKey,
        budgetMin: f.budget[0],
        budgetMax: f.budget[1],
        peopleMin: 1,
        peopleMax: 3,
        tastes: f.tastes,
        intro: f.intro,
        picks: f.picks.map((p) => {
          const m = p.match(/^(.+?)\s+([\d.]+(?:\/串)?(?:\/盘)?)$/);
          if (m) return { name: m[1], price: `约 ${m[2]} 元` };
          return { name: p };
        }),
        couponHint: f.coupon,
        calorieHint: f.cal,
        citySpread: "全国",
        scenes: f.scenes,
      });
    }
  }
  return brands;
}

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
